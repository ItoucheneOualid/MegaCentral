# Compatibilité de l'export MegaCaisse (WinDev) — diagnostic et plan

Scripts : `00_diagnostic_readonly.sql` → `10_migration_compat.sql` → `20_verify_on_copy.sql` → `90_rollback.sql`.
Rien de ceci n'a été exécuté : aucune base MySQL n'est disponible localement et la production n'a pas été touchée.
Les comportements MySQL décrits comme « à vérifier » sont couverts par `20_verify_on_copy.sql`.

## 1. Diagnostic

| Erreur | Cause réelle | Un NULL autorisé suffit-il ? |
|---|---|---|
| `Table 'idmegacentral_v14.TVA' doesn't exist` | Aiven (Linux) tourne avec `lower_case_table_names=0` : les noms de tables sont sensibles à la casse. Cette variable est figée à la création du service (MySQL 8.4 : impossible de la changer ensuite). La base contient `tva` (le site et `megaCaisseSyncController.ts` utilisent `table.toLowerCase()`). | Sans objet : c'est un problème de nom. |
| `1292 Incorrect date value ''` | `''` n'est pas `NULL`. Le schéma de référence (`backend/sql/megacaisse_original_schema.sql`) déclare déjà `Periode_du`, `Periode_au`, `Promo_Date_Debut`, `Promo_Date_Fin` en `DATE DEFAULT NULL`. La colonne est donc déjà nullable et l'erreur survient quand même. | **Non.** Il faudrait que l'export envoie le littéral `NULL`. |

Le contrôleur `/api/sync/megacaisse` n'est pas concerné par l'envoi direct. Il ne convertit pas non plus `''` en `NULL`, donc il aurait la même erreur sur ces colonnes. Le trigger ci-dessous le corrige aussi.

Le site n'utilise ni `Periode_*` ni `Promo_Date_*` : changer leur type ne casse aucune requête. Il utilise uniquement des noms de tables en minuscules.

### NULL, valeur par défaut, chaîne vide
- **NULL** : absence de valeur. Autorisé seulement si la colonne est déclarée `NULL`.
- **DEFAULT** : valeur utilisée **uniquement quand la colonne est omise** de l'`INSERT`. Un `NULL` explicite sur une colonne `NOT NULL` reste une erreur (1048), même avec un défaut. Dans un `ON DUPLICATE KEY UPDATE`, une colonne omise n'est pas modifiée. `col=VALUES(col)` sur une colonne omise prend le défaut.
- **`''`** : une vraie valeur. Valide pour `VARCHAR`/`TEXT`. Invalide pour `DATE`, `TIME`, `INT` et `DECIMAL` en mode strict (erreurs 1292 et 1366). Hors strict, MySQL stocke `0000-00-00` ou `0` avec un avertissement : c'est la corruption silencieuse à éviter.

Conséquence : un trigger `BEFORE INSERT` ne peut pas corriger `''` dans une colonne `DATE`, car la conversion se fait avant le trigger. Pour accepter `''`, la colonne doit être textuelle.

### Colonnes pouvant être facultatives
Les identifiants, clés primaires, relations et données indispensables au site restent `NOT NULL`. La liste complète est en bas de `10_migration_compat.sql`.

| Colonne | Décision | Motif |
|---|---|---|
| `tickets.PDF_Base64` | défaut `''` | le site écrit déjà `''` et teste `IS NOT NULL AND != ''` |
| `ventes.Email_Client` | défaut `''` | simple absence d'email |
| `zreports.Total_Cash` | devient nullable | un défaut `0` inventerait un montant |
| Clés primaires, `articles.LIBELLE`, `familles2.F1CLEUNIK`, `fournis.Fournis_No`, `clients.Client_No`, `ventes.Date/Type/Numero`, `Art_Stat.*` | **inchangées** | identifiants, relations, données essentielles |

Ce tableau repose sur le schéma de référence du dépôt. Il doit être confirmé par `00_diagnostic_readonly.sql` §3-§4.

## 2. Options comparées

| Option | Verdict |
|---|---|
| Autoriser NULL seulement | Insuffisant pour `''` |
| Désactiver le mode strict (global ou par utilisateur via `init_connect`) | **Rejetée.** `''` devient `0000-00-00` et les troncatures passent en silence. `init_connect` n'est pas documenté chez Aiven et ne s'applique pas aux comptes privilégiés. Il n'y a pas de `sql_mode` par utilisateur dans MySQL. |
| **Colonnes de date concernées en `VARCHAR(32) NULL` + triggers BI/BU + fonction `mc_clean_date`** | **Recommandée.** Ciblée, sans perte, sans date inventée. `''` devient `NULL` ; `YYYYMMDD` et `YYYY-MM-DD hh:mm:ss` sont normalisés ; une date invalide est rejetée. Aucune colonne ajoutée, donc les `INSERT` positionnels restent valides. |
| Vues-alias pour la casse (`TVA` → `tva`) | **Recommandée.** Les vues simples acceptent `INSERT`, `UPDATE`, `DELETE`, `REPLACE` et `ON DUPLICATE KEY UPDATE`, et déclenchent les triggers de la table de base. |
| Renommer les tables en `TVA`, etc. | Rejetée : casse le site et l'API. |
| Tables d'import intermédiaires (staging) | Voir ci-dessous. |
| Proxy de réécriture (ProxySQL) | Dernier recours : compatibilité maximale, mais nouveau point de défaillance hors Aiven. |

**Staging** : l'export écrit dans des tables aux noms `articles`, `familles2`, etc. Pour que ces noms deviennent du staging, il faudrait déplacer les vraies tables sous d'autres noms. Cela imposerait de réécrire toutes les requêtes du site et du sync, de dupliquer les données (PDF en `longtext`) et de maintenir des triggers de synchronisation. Cette option n'est justifiée que si le diagnostic §9 montre beaucoup de colonnes numériques ou temporelles recevant `''`. Elle serait aussi possible via un schéma séparé, mais seulement si le programmeur peut changer le nom de base dans sa configuration (pas son code).

### Effets sur INSERT, UPDATE et ON DUPLICATE KEY UPDATE
- Les triggers `BEFORE INSERT` et `BEFORE UPDATE` se déclenchent tous les deux sur un `ON DUPLICATE KEY UPDATE`. Les valeurs vides sont donc normalisées dans les deux cas.
- Si la caisse envoie `''` pour une date qui existait, la date devient `NULL`. C'est la sémantique de l'export : la caisse reste la source de vérité. Elle est testée en B4.
- `VALUES()` est déprécié depuis 8.0.20 mais fonctionne en 8.4. Le trigger `BEFORE UPDATE` couvre le cas où `VALUES()` renverrait la valeur brute.
- Les `UPDATE` et `INSERT` existants du site et de l'API sont inchangés : ils envoient `NULL` ou une date `YYYY-MM-DD`, qui passe la validation.
- Les `ALTER` de type reconstruisent la table et bloquent les écritures pendant quelques secondes à minutes. Prévoir une fenêtre avec le programmeur.
- Les alias de vues seront visibles dans `SHOW TABLES`, donc dans `debugController` et dans `backup_database.ts` et `replace_schema_with_megacaisse.js` (qui rejettent les vues). Un dump contenant `TVA` et `tva` **ne peut pas être restauré** sur MySQL Windows ou macOS (`lower_case_table_names` ≠ 0). Les copies de test doivent tourner sous Linux (fork Aiven).

### Limites propres à MySQL 8.4 et à Aiven
- `lower_case_table_names` est immuable après création du service ; seul un nouveau service permettrait de le changer.
- `avnadmin` n'a pas `SUPER` : créer des triggers et des fonctions exige `log_bin_trust_function_creators=1` (`00` §1). Sinon, il faut contacter Aiven.
- `performance_schema` (`00` §9) doit être actif pour lire les gabarits de requêtes de l'export.
- La fonction et les triggers gardent le `sql_mode` de la session qui les crée : créer avec le `sql_mode` strict de production.
- Un défaut sur `TEXT`/`LONGTEXT` s'écrit `DEFAULT ('')` (expression, MySQL ≥ 8.0.13).
- `DATE` → `VARCHAR` conserve les valeurs. Le retour arrière est sans perte tant que le format ISO est respecté (pré-contrôles dans `90`).

## 3. Compatibilité totale impossible sans adaptation de l'export

La compatibilité n'est pas totale dans ces cas :
1. **`''` dans une colonne numérique ou temporelle non traitée** (`DECIMAL`, `INT`, `TIME`, autres `DATE` comme `Derniere_MAJ`). Il faut soit une conversion par colonne (la même recette que les dates, mais gênante pour les champs numériques ou lus par le site), soit un staging, soit le proxy. Les tests E1 et E2 le montrent. Le diagnostic §9a-§9b dit lesquelles sont réellement envoyées.
2. **`''` dans une colonne `NOT NULL` indispensable** (`ventes.Date`, `Art_Stat.Date`) : à rejeter, car la donnée manque (test E3).
3. **`NULL` explicite dans une colonne `NOT NULL`** : refusé même avec un défaut.
4. `TRUNCATE`, `DROP` ou `ALTER` sur les noms en majuscules (vues) : impossible (test A5).
5. Des valeurs de date non ISO (`dd/mm/yyyy`) : rejetées. Il faudrait connaître le format exact pour les accepter.

## 4. Procédure

**Informations à me renvoyer** : résultats de `00_diagnostic_readonly.sql` (surtout §1, §2, §3, §5, §7, §9).

**Sauvegarde (avant toute modification)**
1. Console Aiven → *Backups* : noter l'heure de la dernière sauvegarde automatique (point-in-time recovery disponible selon le plan).
2. Dump logique de ce qui sera modifié (depuis une machine avec `mysqldump`, `ca.pem` Aiven) :
   ```
   mysqldump -h <host> -P <port> -u avnadmin -p --ssl-mode=VERIFY_CA --ssl-ca=ca.pem --single-transaction --routines --triggers --set-gtid-purged=OFF idmegacentral_v14 articles familles2 tickets ventes zreports tva users magasin param art_stat bc_frn bc_lignes > pre_compat_YYYYMMDD.sql
   ```
   Ajouter un `SHOW CREATE TABLE` de chaque table modifiée (`00` §3). Le dossier `backend/db_backups` n'est pas versionné automatiquement : y garder les dumps et vérifier `.gitignore`.
3. Fenêtre de maintenance convenue avec le programmeur (export en pause pendant les `ALTER`).

**Copie de test** : fork du service Aiven depuis la dernière sauvegarde (Console → *Fork service*, un coût s'applique). Exécuter dessus `10` puis `20` : `fails` doit être `0` et `residus` `0`. Faire tourner le site contre la copie (variables `DB_*`) et refaire le parcours : articles, familles, TVA, factures et tickets (PDF), commandes, fournisseurs.

**Production** : `10_migration_compat.sql` en session stricte, puis relancer l'export réel et surveiller `00` §9a. Supprimer le fork.

**Retour arrière** : `90_rollback.sql` (pré-contrôles à 0). En dernier recours, restauration du dump ou du fork.
