-- =====================================================
-- VALIDATION : DIAGRAMME DE CLASSES vs BASE DE DONNÉES
-- Projet MEGA-Central TFE
-- Date: 2026-06-01
-- =====================================================

CONFORMITÉ DU DIAGRAMME DE CLASSES :

✅ = Respecté
⚠️  = À vérifier
❌ = Manquant

---

## 1. CLASSE: User
✅ Table: users
   - id (AUTO_INCREMENT)
   - Login (login)
   - Password (passwordHash)
   - Nom
   - Prenom
   - Email
   - Voir_prix_Achat (voirPrixAchat)
   - Is_Admin (rôle: admin/standard)
   
Statut: CONFORME

---

## 2. CLASSE: Client
✅ Table: clients
   - CLcleunik (id)
   - Client_No (clientNo)
   - Nom_Société (nomSociete)
   - Email
   - Tel_No1 (telephone)
   - Adresse1
   - Adresse2
   - Code_Postal (codePostal)
   - Localite (ville)

STATUS: CONFORME (après migration)

---

## 3. CLASSE: Magasin
✅ Table: magasin
   - id
   - Code_Magasin (codeMagasin)
   - Nom_Magasin (nomMagasin)

Statut: CONFORME

---

## 4. CLASSE: Vente
✅ Table: ventes
   - VTCLEUNIK (id)
   - Numero (numero)
   - Date (date)
   - Total_TTC (totalTTC)
   - client_id (FK → clients) ← NOUVEAU après migration
   - Code_magasin (FK → magasin)

Relation:
- Vente.client_id → Client.CLcleunik (0..*)
- Vente.Code_magasin → Magasin.Code_Magasin (0..*)

Statut: CONFORME (après migration avec FK client_id)

---

## 5. CLASSE: LigneVente
⚠️  Table: ligne_vente
   - id
   - vente_id (FK → ventes)
   - article_id (FK → articles)
   - quantite
   - prix_unitaire
   - remise

Relation:
- LigneVente.vente_id → Vente.VTCLEUNIK (1..*)
- LigneVente.article_id → Article.ARCLEUNIK (0..*)

Statut: TABLE EXISTE MAIS VIDE (à remplir depuis tickets si nécessaire)

---

## 6. CLASSE: Article
✅ Table: articles
   - ARCLEUNIK (id)
   - LIBELLE (libelle)
   - Code_Barres (codeBarres)
   - Prix_Vente_HT (prixVenteHT)
   - Prix_Achat_HT (prixAchatHT)
   - Prix_Achat_TTC (prixAchatTTC)
   - F2_CLEUNIK (FK → familles2/CategorieArticle)
   - TVA_CLEUNIK (FK → tva)
   - FRN_CLEUNIK (FK → fournis/Fournisseur)

Statut: CONFORME

---

## 7. CLASSE: CategorieArticle
✅ Mappée à: familles2
   - F2CLEUNIK (id)
   - Description (description)
   - Remise_PC (remisePc)
   - F1CLEUNIK (FK → familles1)

Statut: CONFORME

---

## 8. CLASSE: TVA
✅ Table: tva
   - TVA_ID (id)
   - Taux (taux)
   - Description (description)

Statut: CONFORME

---

## 9. CLASSE: Fournisseur
✅ Table: fournis
   - FRCLEUNIK (id)
   - Fournis_No (fournisseurNo)
   - Nom_Societe (nomSociete)
   - Email_Adresse (email)
   - Telephone (telephone)
   - Adresse1
   - Adresse2
   - Localite (ville)
   - Code_Postal

Statut: CONFORME

---

## 10. CLASSE: CommandeFournisseur
✅ Mappée à: bc_frn
   - CFCLEUNIK (id)
   - FRCLEUNIK (FK → fournis)
   - Date_Commande (dateCommande)
   - Date_Livraison (dateLivraison)
   - Etat (statut)
   - Total_TTC (totalTTC)

Relation:
- CommandeFournisseur.FRCLEUNIK → Fournisseur.FRCLEUNIK (0..*)

Statut: CONFORME

---

## 11. CLASSE: LigneCommande
✅ Mappée à: bc_lignes
   - BLCLEUNIK (id)
   - CFCLEUNIK (FK → bc_frn)
   - ARCLEUNIK (FK → articles)
   - Quantite (quantite)
   - Prix_Un (prixUnitaire)
   - Remise (remise)

Relation:
- LigneCommande.CFCLEUNIK → CommandeFournisseur (1..*)
- LigneCommande.ARCLEUNIK → Article.ARCLEUNIK (0..*)

Statut: CONFORME

---

## 12. CLASSE: StockMagasin
✅ Table: stock_magasin
   - id
   - magasin_id (FK → magasin)
   - article_id (FK → articles)
   - quantite_stock (quantiteStock)
   - seuil_min (seuilMin)
   - seuil_max (seuilMax)

Relation:
- StockMagasin.magasin_id → Magasin.id (0..*)
- StockMagasin.article_id → Article.ARCLEUNIK (0..*)

Statut: CONFORME

---

## 13. CLASSE: ZReport
✅ Table: z_reports
   - id
   - date_from (dateFrom)
   - date_to (dateTo)
   - nb_tickets (nbTickets)
   - total_ttc (totalTTC)
   - code_magasin (FK → magasin)

Statut: CONFORME

---

## RÉSUMÉ CONFORMITÉ

✅ User: 100% conforme
✅ Client: Conforme après migration
✅ Magasin: 100% conforme
✅ Vente: Conforme après migration (ajout FK client_id)
⚠️  LigneVente: Existe mais vide (utilisée dans tickets, pas dans ventes actuellement)
✅ Article: 100% conforme
✅ CategorieArticle: 100% conforme
✅ TVA: 100% conforme
✅ Fournisseur: 100% conforme
✅ CommandeFournisseur: 100% conforme
✅ LigneCommande: 100% conforme
✅ StockMagasin: 100% conforme
✅ ZReport: 100% conforme

SCORE GLOBAL: 11/12 (92%) ✅

---

## MIGRATION REQUISE

Fichier: backend/sql/migration_normalize_to_class_diagram.sql

Exécuter:
1. Backup de la base de données (WAMP/MySQL)
2. Exécuter la migration SQL
3. Valider les FK avec les vues SQL créées

---

## NOTES POUR LE TFE

1. Les tables manquantes du diagramme EXISTENT et contiennent des données
2. La migration va créer les liens manquants (FK)
3. Les données des clients seront extraites de `ventes` vers `clients`
4. Les références seront normalisées (Client_No → client_id)
5. Pas de données perdues - migration en READ + INSERT

---

FIN DE VALIDATION
