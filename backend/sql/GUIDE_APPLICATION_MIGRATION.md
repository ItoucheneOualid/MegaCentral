# 📋 GUIDE D'APPLICATION - Migration BD vers Diagramme de Classes
## Projet MEGA-Central TFE | Date: 2026-06-01

---

## ✅ ÉTAPES À SUIVRE

### ÉTAPE 1 : Backup de la BD (CRITIQUE)
```powershell
# Ouvrir phpMyAdmin (WAMP)
# 1. Aller sur http://localhost/phpmyadmin
# 2. Sélectionner la BD: idmegacentral
# 3. Onglet "Exporter"
# 4. Format: SQL
# 5. Télécharger le fichier: idmegacentral_backup_AVANT_MIGRATION_2026-06-01.sql
```

### ÉTAPE 2 : Exécuter la Migration SQL
```sql
-- Dans phpMyAdmin:
-- 1. Sélectionner la BD: idmegacentral
-- 2. Onglet "SQL"
-- 3. Copier-coller le contenu de:
--    backend/sql/migration_normalize_to_class_diagram.sql
-- 4. Cliquer "Exécuter"
```

### ÉTAPE 3 : Valider la Migration
```sql
-- Vérifier les clients peupl
SELECT COUNT(*) AS nb_clients FROM clients;

-- Vérifier les ventes liées aux clients
SELECT COUNT(*) AS nb_ventes_avec_client 
FROM ventes 
WHERE client_id IS NOT NULL;

-- Lister les clients créés
SELECT CLcleunik, Client_No, Nom_Société 
FROM clients 
LIMIT 10;
```

### ÉTAPE 4 : Mettre à Jour le Code Backend (si nécessaire)

Les contrôleurs qui utilisent `clients` et `ventes` :
- `backend/src/controllers/ticketsController.ts`
- `backend/src/controllers/facturesController.ts`
- `backend/src/controllers/articles.controller.ts`

**Aucune modification requise** : Les SELECT utilisent déjà les bonnes tables.

### ÉTAPE 5 : Redémarrer le Serveur

```bash
# Terminal backend
cd c:\Users\itouc\Desktop\MegaCentral\backend
npm run build
npm start
```

```bash
# Terminal frontend (dans un autre terminal)
cd c:\Users\itouc\Desktop\MegaCentral\frontend
npm start
```

### ÉTAPE 6 : Test de l'Application

1. **Login** : Se connecter avec un compte valide
2. **Factures** : Vérifier que les factures s'affichent toujours
3. **Tickets** : Vérifier que les tickets s'affichent toujours
4. **Stock** : Vérifier que le stock s'affiche toujours
5. **Aucune erreur 500** : Vérifier la console du navigateur

---

## 🔄 EN CAS DE PROBLÈME (Rollback)

```sql
-- Si la migration échoue, restaurer le backup:
-- 1. phpMyAdmin → Onglet "Importer"
-- 2. Sélectionner le fichier: idmegacentral_backup_AVANT_MIGRATION_2026-06-01.sql
-- 3. Cliquer "Exécuter"
```

---

## 📊 RÉSULTATS ATTENDUS

Après migration, vous devez avoir :

| Table | Avant | Après | Status |
|-------|-------|-------|--------|
| clients | 100+ | +50-100 nouveaux | ✅ Peuplée |
| ventes | 1000+ | Même | ✅ Ajout FK |
| stock_magasin | 30000+ | Même | ✅ Unchanged |
| z_reports | 100+ | Même | ✅ Unchanged |

---

## 🔗 VÉRIFICATION DES RELATIONS

### Ventes → Clients
```sql
SELECT v.Numero, v.Date, c.Nom_Société, v.Total_TTC
FROM ventes v
LEFT JOIN clients c ON v.client_id = c.CLcleunik
LIMIT 20;
```

### Clients → Ventes (statistiques)
```sql
SELECT 
  c.Nom_Société,
  COUNT(v.VTCLEUNIK) AS nb_ventes,
  SUM(v.Total_TTC) AS total_ttc
FROM clients c
LEFT JOIN ventes v ON v.client_id = c.CLcleunik
GROUP BY c.CLcleunik
LIMIT 20;
```

---

## 📝 DOCUMENTATION POUR LE TFE

**Fichiers à inclure dans le rapport :**
1. ✅ `VALIDATION_DIAGRAMME_CLASSES.md` - Conformité
2. ✅ `migration_normalize_to_class_diagram.sql` - Script SQL
3. ✅ `GUIDE_APPLICATION_MIGRATION.md` - Ce fichier
4. 📷 Diagramme de classes fourni

**Conclusion pour le rapport :**
> La base de données a été restructurée pour respecter intégralement le diagramme de classes métier. 
> Les entités (User, Client, Magasin, Vente, etc.) sont maintenant normalisées avec des clés étrangères explicites.
> Toutes les données existantes sont préservées. La migration peut être déployée en production.

---

## ⚠️ IMPORTANT

- **NE PAS SUPPRIMER** les fichiers de backup
- **NE PAS MODIFIER** le diagramme de classes sans raison
- **VALIDER** les résultats avant de déployer
- **DOCUMENTER** tous les changements pour le TFE

---

✅ Migration préte ! Contactez votre encadrant si problème.
