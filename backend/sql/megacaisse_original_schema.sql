-- Canonical MegaCaisse schema extracted from the 17 supplied SQL dumps.
-- Includes the exported primary keys, indexes, and auto-increment settings.
-- No MegaCentral-only tables or columns are included.

CREATE TABLE `articles` (
  `ARCLEUNIK` double NOT NULL,
  `LIBELLE` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Code_Barres` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Prix_TTC1` decimal(12,2) DEFAULT NULL,
  `Prix_TTC2` decimal(12,2) DEFAULT NULL,
  `Prix_TTC3` decimal(12,2) DEFAULT NULL,
  `Prix_TTC4` decimal(12,2) DEFAULT NULL,
  `Prix_TTC5` decimal(12,2) DEFAULT NULL,
  `Prix_Vente_HT` decimal(12,2) DEFAULT NULL,
  `Prix_Achat_HT` decimal(12,2) DEFAULT NULL,
  `Prix_Achat_TTC` decimal(12,2) DEFAULT NULL,
  `Prix_Sur_Qte` decimal(12,2) DEFAULT NULL,
  `Prix_Qte_Min` smallint DEFAULT NULL,
  `Unite` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Emballage` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `F1_Cleunik` int UNSIGNED DEFAULT NULL,
  `F2_CLEUNIK` int UNSIGNED DEFAULT NULL,
  `TVA_CLEUNIK` int DEFAULT NULL,
  `FRN_CLEUNIK` int UNSIGNED DEFAULT NULL,
  `FRN_Reference` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Promo_Prix_TTC` decimal(12,2) DEFAULT NULL,
  `Promo_Date_Debut` date DEFAULT NULL,
  `Promo_Date_Fin` date DEFAULT NULL,
  `Date_Modifiée` date DEFAULT NULL,
  `Date_importation` date DEFAULT NULL,
  `Exporté_àCentral` tinyint(1) NOT NULL DEFAULT '0',
  `Qte_Min` smallint DEFAULT NULL,
  `Qte_Max` smallint DEFAULT NULL,
  `Gestion_Stock` tinyint(1) NOT NULL DEFAULT '0',
  `Vidange_Code` decimal(12,2) DEFAULT NULL,
  `Vidange_Article` tinyint(1) NOT NULL DEFAULT '0',
  `Article_àPeser` tinyint(1) NOT NULL DEFAULT '0',
  `Photo_ID` decimal(12,2) DEFAULT NULL,
  `Nouvelligne` tinyint(1) NOT NULL DEFAULT '0',
  `Marge_Pc1` decimal(12,2) DEFAULT NULL,
  `RemiseMax` decimal(12,2) DEFAULT NULL,
  `Points_Action` smallint DEFAULT NULL,
  `Qte_par_boite` decimal(12,2) DEFAULT NULL,
  `Cat_Electronic` tinyint(1) NOT NULL DEFAULT '0',
  `Poids_Un` decimal(12,2) DEFAULT NULL,
  `Suspendu` tinyint(1) NOT NULL DEFAULT '0',
  `Suspendu_Date` date DEFAULT NULL,
  `ingédients_FR` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ingédients_NL` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Valeurs_Nutritionelles` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ExtraField1` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ExtraField2` decimal(12,2) DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL,
  `Frais_Accise` decimal(12,2) DEFAULT NULL,
  `Frais_Transport` decimal(12,2) DEFAULT NULL,
  `Prix_revient` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Art_Stat` (
  `ID` int NOT NULL,
  `ARCLEUNIK` int NOT NULL,
  `Date` date NOT NULL,
  `Code_Magasin` varchar(2) NOT NULL,
  `Quantite` int NOT NULL,
  `Prix_Moyen` decimal(10,2) NOT NULL,
  `Montant` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `barcodes` (
  `IDBarCodes` int UNSIGNED NOT NULL,
  `ARCLEUNIK` int UNSIGNED NOT NULL,
  `CodeBarre` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CB_Colis` tinyint(1) NOT NULL DEFAULT '0',
  `Vidange_Code` int DEFAULT NULL,
  `Vidange_Unique` tinyint(1) NOT NULL DEFAULT '0',
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `BC_FRN` (
  `CFCLEUNIK` int UNSIGNED NOT NULL,
  `FRCLEUNIK` int UNSIGNED NOT NULL,
  `Fournis_No` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Fournis_Nom` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Commande` date DEFAULT NULL,
  `Date_Livraison` date DEFAULT NULL,
  `Mode_Livraison` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Total_HT_Brut` decimal(10,2) DEFAULT NULL,
  `Total_HT_Net` decimal(10,2) DEFAULT NULL,
  `Total_Brut` decimal(10,2) DEFAULT NULL,
  `Total_Tva` decimal(10,2) DEFAULT NULL,
  `Total_TTC` decimal(10,2) DEFAULT NULL,
  `Remise_PC` decimal(10,4) DEFAULT NULL,
  `Remise` decimal(10,2) DEFAULT NULL,
  `Etat` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Type_TVA` tinyint UNSIGNED DEFAULT NULL,
  `Remarques` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL,
  `Magasin_No` tinyint DEFAULT NULL,
  `BC_ID` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `BC_Lignes` (
  `BLCLEUNIK` int UNSIGNED NOT NULL,
  `CCCLEUNIK` int UNSIGNED DEFAULT NULL,
  `CFCLEUNIK` int UNSIGNED DEFAULT NULL,
  `ARCLEUNIK` int UNSIGNED DEFAULT NULL,
  `LIBELLE` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Quantite` decimal(12,2) DEFAULT NULL,
  `Prix_Un` decimal(12,2) DEFAULT NULL,
  `Taux_Tva` decimal(12,2) DEFAULT NULL,
  `Nature` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Remise` decimal(12,2) DEFAULT NULL,
  `Remise_PC` decimal(12,2) DEFAULT NULL,
  `Qte_de_boites` smallint DEFAULT NULL,
  `Qte_par_boite` decimal(12,2) DEFAULT NULL,
  `Ligne_no` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Code2` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL,
  `BC_ID` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `clients` (
  `CLcleunik` int UNSIGNED NOT NULL,
  `Tva_No` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Client_No` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_Société` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Nom_Gerant` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse1` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse2` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Code_Postal` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Localite` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tel_No1` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tel_No2` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tva_pays` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Nom_Pays` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Peppol_ID` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Carte_No` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ID_Action` tinyint DEFAULT NULL,
  `Type_Action` int DEFAULT NULL,
  `CA_Action` decimal(12,2) DEFAULT NULL,
  `Titre_Civilité` int DEFAULT NULL,
  `Prix_Groupe` tinyint DEFAULT NULL,
  `Type_Tva` tinyint DEFAULT NULL,
  `Credit_Limit` int DEFAULT NULL,
  `EcheanceJours` smallint DEFAULT NULL,
  `PrixSontHTVA` tinyint(1) NOT NULL DEFAULT '0',
  `Remise_PC` decimal(5,2) DEFAULT NULL,
  `Jours_echeance` smallint DEFAULT NULL,
  `Date_Entree` date DEFAULT NULL,
  `Suspendu` tinyint(1) NOT NULL DEFAULT '0',
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `familles1` (
  `F1cleunik` int UNSIGNED NOT NULL,
  `Description` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `familles2` (
  `F2CLEUNIK` int UNSIGNED NOT NULL,
  `Description` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Remise_PC` decimal(12,2) DEFAULT NULL,
  `Periode_du` date DEFAULT NULL,
  `Periode_au` date DEFAULT NULL,
  `F1CLEUNIK` int UNSIGNED NOT NULL,
  `TVCLEUNIK` int DEFAULT NULL,
  `RemiseNonAppliquee` tinyint(1) NOT NULL DEFAULT '0',
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `fotos` (
  `ARCLEUNIK` double NOT NULL,
  `Photo_Name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Photo_Base64` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `fournis` (
  `FRCLEUNIK` int UNSIGNED NOT NULL,
  `Fournis_No` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_Societe` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Adresse1` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse2` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Localite` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Code_Postal` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Pays_Nom` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Telephone` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Nom_Contact` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Compte_bancaire` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email_Adresse` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Entree` date DEFAULT NULL,
  `TVA_Code` tinyint UNSIGNED DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Magasin` (
  `id` int NOT NULL,
  `Code_Magasin` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Nom_Magasin` varchar(45) DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `Param` (
  `id` int NOT NULL,
  `Entete_Ligne1` text,
  `Entete_Ligne2` text,
  `Entete_Ligne3` text,
  `Entete_Ligne4` text,
  `Entete_Ligne5` text,
  `Entete_Facture` text,
  `Supplier_Tva_No` text,
  `Supplier_Peppol_Id` text,
  `Supplier_Iban` text,
  `Supplier_Email` varchar(45) DEFAULT NULL,
  `Pied_Page_Facture` text,
  `Langues_Ecran` varchar(45) DEFAULT NULL,
  `Pays_Code` varchar(2) DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `tickets` (
  `Type` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Numero` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Date` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Caisse` tinyint DEFAULT NULL,
  `Total_Brut` decimal(10,2) DEFAULT NULL,
  `Total_TTC` decimal(10,2) DEFAULT NULL,
  `Total_Tva` decimal(10,2) DEFAULT NULL,
  `Total_HT` decimal(10,2) DEFAULT NULL,
  `Remise_PC` decimal(10,4) DEFAULT NULL,
  `Remise_EnPC` decimal(10,2) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `CACLEUNIK` int DEFAULT NULL,
  `Paiements` decimal(10,2) DEFAULT NULL,
  `Solde` decimal(10,2) DEFAULT NULL,
  `Nature` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BA_utilise` tinyint UNSIGNED DEFAULT '0',
  `Base_Imp1` decimal(10,2) DEFAULT NULL,
  `Base_Imp2` decimal(10,2) DEFAULT NULL,
  `Base_Imp3` decimal(10,2) DEFAULT NULL,
  `Base_Imp4` decimal(10,2) DEFAULT NULL,
  `Benefice` decimal(10,2) DEFAULT NULL,
  `SECLEUNIK` int DEFAULT NULL,
  `Client_No` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Echeance` date DEFAULT NULL,
  `Action_Type` tinyint UNSIGNED DEFAULT NULL,
  `Remarques` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Points_total` int DEFAULT NULL,
  `Montant_CC` decimal(10,2) DEFAULT NULL,
  `CC_used` tinyint(1) NOT NULL DEFAULT '0',
  `Ticket_Facturée` tinyint(1) NOT NULL DEFAULT '0',
  `Montant_Acompte` decimal(10,2) DEFAULT NULL,
  `Client_Nom` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Code_Carte` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Etat` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Time_end` time DEFAULT NULL,
  `Paiement1` decimal(10,2) DEFAULT NULL,
  `Paiement2` decimal(10,2) DEFAULT NULL,
  `Paiement3` decimal(10,2) DEFAULT NULL,
  `Paiement4` decimal(10,2) DEFAULT NULL,
  `Paiement5` decimal(10,2) DEFAULT NULL,
  `Paiement6` decimal(10,2) DEFAULT NULL,
  `Paiement7` decimal(10,2) DEFAULT NULL,
  `Code_Magasin` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ExtraField1` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ExtraField2` decimal(12,4) DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL,
  `Montant_Credit` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Montant_BA` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PDF_Base64` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `TVA` (
  `TVA_ID` int UNSIGNED NOT NULL,
  `Taux` decimal(10,4) DEFAULT NULL,
  `Description` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Users` (
  `id` int NOT NULL,
  `Login` varchar(45) DEFAULT NULL,
  `Password` varchar(45) DEFAULT NULL,
  `Nom` varchar(45) DEFAULT NULL,
  `Prenom` varchar(45) DEFAULT NULL,
  `Email` varchar(145) DEFAULT NULL,
  `Voir_prix_Achat` varchar(1) DEFAULT NULL,
  `Is_Admin` varchar(1) DEFAULT NULL,
  `Derniere_Connexion_Time` varchar(45) DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `ventes` (
  `VTCLEUNIK` int UNSIGNED NOT NULL,
  `Numero` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Date` date NOT NULL,
  `Type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Client_No` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Client_Nom` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Total_B_HT` decimal(10,2) DEFAULT NULL,
  `Total_N_HT` decimal(10,2) DEFAULT NULL,
  `Total_Tva` decimal(10,2) DEFAULT NULL,
  `Total_TTC` decimal(10,2) DEFAULT NULL,
  `Devise` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Cours_DP` decimal(10,4) DEFAULT NULL,
  `Paiements` decimal(10,2) DEFAULT NULL,
  `Solde` decimal(10,2) DEFAULT NULL,
  `Remises` decimal(10,4) DEFAULT NULL,
  `Remise_pc` decimal(10,4) DEFAULT NULL,
  `Benefice` decimal(12,2) DEFAULT NULL,
  `Tva_code` int DEFAULT NULL,
  `Base_imp1` decimal(10,2) DEFAULT NULL,
  `Base_imp2` decimal(10,2) DEFAULT NULL,
  `Base_imp3` decimal(10,2) DEFAULT NULL,
  `Base_imp4` decimal(10,2) DEFAULT NULL,
  `Echeance` date DEFAULT NULL,
  `Liv_Date` date DEFAULT NULL,
  `Leur_ref` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Etat` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse1` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse2` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CP` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Ville` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NbrArticles` smallint DEFAULT NULL,
  `Prix_Sont_TTC` tinyint(1) NOT NULL DEFAULT '0',
  `Prix_Groupe` int DEFAULT NULL,
  `SECLEUNIK` bigint DEFAULT NULL,
  `CACLEUNIK` int DEFAULT NULL,
  `Caisse_No` smallint UNSIGNED DEFAULT NULL,
  `Code_magasin` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Peppol_Statut` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Remarques` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Derniere_MAJ` date DEFAULT NULL,
  `PDF_Base64` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Email_Client` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Zreports` (
  `id` int NOT NULL,
  `Date` date DEFAULT NULL,
  `Code_Magasin` varchar(2) DEFAULT NULL,
  `PDF_Base64` longtext,
  `CA_TTC_Jour` decimal(10,2) DEFAULT NULL,
  `Nbr_Tickets` int DEFAULT NULL,
  `Total_Cash` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `articles`
  ADD PRIMARY KEY (`ARCLEUNIK`),
  ADD KEY `idx_articles_LIBELLE` (`LIBELLE`),
  ADD KEY `idx_articles_Code_Barres` (`Code_Barres`),
  ADD KEY `idx_articles_F1_Cleunik` (`F1_Cleunik`),
  ADD KEY `idx_articles_F2_CLEUNIK` (`F2_CLEUNIK`),
  ADD KEY `idx_articles_TVA_CLEUNIK` (`TVA_CLEUNIK`),
  ADD KEY `idx_articles_FRN_CLEUNIK` (`FRN_CLEUNIK`),
  ADD KEY `idx_articles_FRN_Reference` (`FRN_Reference`),
  ADD KEY `idx_articles_Date_Modifiee` (`Date_Modifiée`),
  ADD KEY `idx_articles_Exporte_Central` (`Exporté_àCentral`);

ALTER TABLE `Art_Stat`
  ADD PRIMARY KEY (`ID`);

ALTER TABLE `Art_Stat`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=468630;

ALTER TABLE `barcodes`
  ADD PRIMARY KEY (`IDBarCodes`),
  ADD KEY `idx_barcodes_ARCLEUNIK` (`ARCLEUNIK`),
  ADD KEY `idx_barcodes_CodeBarre` (`CodeBarre`);

ALTER TABLE `BC_FRN`
  ADD PRIMARY KEY (`CFCLEUNIK`),
  ADD KEY `idx_bcfrn_FRCLEUNIK` (`FRCLEUNIK`),
  ADD KEY `idx_bcfrn_Fournis_No` (`Fournis_No`),
  ADD KEY `idx_bcfrn_Fournis_Nom` (`Fournis_Nom`),
  ADD KEY `idx_bcfrn_Etat` (`Etat`);

ALTER TABLE `BC_Lignes`
  ADD PRIMARY KEY (`BLCLEUNIK`),
  ADD KEY `idx_bclignes_CCCLEUNIK` (`CCCLEUNIK`),
  ADD KEY `idx_bclignes_CFCLEUNIK` (`CFCLEUNIK`),
  ADD KEY `idx_bclignes_ARCLEUNIK` (`ARCLEUNIK`),
  ADD KEY `idx_bclignes_Nature` (`Nature`);

ALTER TABLE `clients`
  ADD PRIMARY KEY (`CLcleunik`),
  ADD KEY `idx_clients_pro_Tva_No` (`Tva_No`),
  ADD KEY `idx_clients_pro_Nom_Societe` (`Nom_Société`),
  ADD KEY `idx_clients_pro_Peppol_ID` (`Peppol_ID`),
  ADD KEY `idx_clients_pro_Carte_No` (`Carte_No`);

ALTER TABLE `familles1`
  ADD PRIMARY KEY (`F1cleunik`),
  ADD KEY `idx_familles1_Description` (`Description`);

ALTER TABLE `familles2`
  ADD PRIMARY KEY (`F2CLEUNIK`),
  ADD KEY `idx_familles2_Description` (`Description`),
  ADD KEY `idx_familles2_F1CLEUNIK` (`F1CLEUNIK`),
  ADD KEY `idx_familles2_TVCLEUNIK` (`TVCLEUNIK`);

ALTER TABLE `fotos`
  ADD PRIMARY KEY (`ARCLEUNIK`) USING BTREE;

ALTER TABLE `fournis`
  ADD PRIMARY KEY (`FRCLEUNIK`),
  ADD UNIQUE KEY `uniq_fournis_Fournis_No` (`Fournis_No`),
  ADD KEY `idx_fournis_Nom_Societe` (`Nom_Societe`);

ALTER TABLE `Magasin`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `Magasin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `Param`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tickets`
  ADD PRIMARY KEY (`Numero`),
  ADD KEY `idx_tickets_Date` (`Date`),
  ADD KEY `idx_tickets_CACLEUNIK` (`CACLEUNIK`),
  ADD KEY `idx_tickets_SECLEUNIK` (`SECLEUNIK`),
  ADD KEY `idx_tickets_Client_No` (`Client_No`),
  ADD KEY `idx_tickets_Client_Nom` (`Client_Nom`),
  ADD KEY `idx_tickets_Etat` (`Etat`),
  ADD KEY `idx_tickets_Code_Magasin` (`Code_Magasin`);

ALTER TABLE `TVA`
  ADD PRIMARY KEY (`TVA_ID`),
  ADD KEY `idx_tva_Taux` (`Taux`);

ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `Users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `ventes`
  ADD PRIMARY KEY (`Numero`),
  ADD KEY `idx_ventes_Date` (`Date`),
  ADD KEY `idx_ventes_Client_No` (`Client_No`),
  ADD KEY `idx_ventes_Client_Nom` (`Client_Nom`),
  ADD KEY `idx_ventes_SECLEUNIK` (`SECLEUNIK`),
  ADD KEY `idx_ventes_CACLEUNIK` (`CACLEUNIK`),
  ADD KEY `idx_ventes_Code_magasin` (`Code_magasin`),
  ADD KEY `idx_ventes_Peppol_Statut` (`Peppol_Statut`);

ALTER TABLE `Zreports`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `Zreports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=779;
