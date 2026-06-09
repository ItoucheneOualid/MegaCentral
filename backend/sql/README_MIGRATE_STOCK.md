# Migration Stock Consolidation

Ce fichier explique comment sauvegarder la base et exécuter la migration qui consolide la gestion du stock dans `stock_magasin`.

Pré-requis
- Accès à la base MySQL `idmegacentral`.
- Droits pour créer tables et modifier schéma.

Étapes recommandées

1. Sauvegarde complète (local):

```bash
mysqldump -u <user> -p idmegacentral > idmegacentral_backup_$(date +%F).sql
```

2. Éditer `migrate_stock_consolidation.sql` et remplacer `__DEFAULT_MAGASIN_ID__`
   par l'id du magasin à utiliser pour backfiller les quantités présentes dans `articles`.

3. Exécuter le script depuis votre client MySQL :

```sql
SOURCE path/to/backend/sql/migrate_stock_consolidation.sql;
```

4. Vérifier les résultats :

```sql
SELECT COUNT(*) FROM stock_magasin;
SELECT SUM(quantite) FROM stock_magasin;
```

5. Après validation :
- Mettre à jour le backend pour utiliser `stock_magasin` pour les lectures/écritures de stock.
- Lancer les tests et vérifier l'application.

Remarques
- Ce script suppose l'existence d'une table `magasin` avec une colonne `id`.
- Pour des migrations plus complexes (répartition multi-magasins), préférez un script Node/TS transactionnel.
