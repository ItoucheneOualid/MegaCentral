CREATE DATABASE IF NOT EXISTS megacentral CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE megacentral;

CREATE TABLE TVA (
    guid VARCHAR(36) NOT NULL,
    id_tva INT NOT NULL,
    libelle VARCHAR(50) NOT NULL,
    taux DECIMAL(5,4) NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_tva),
    INDEX idx_taux (taux),
    INDEX idx_actif (actif)
) ENGINE=InnoDB;

CREATE TABLE FAM1 (
    guid VARCHAR(36) NOT NULL,
    id_fam1 INT NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_fam1),
    INDEX idx_libelle (libelle),
    INDEX idx_actif (actif)
) ENGINE=InnoDB;

CREATE TABLE FAM2 (
    guid VARCHAR(36) NOT NULL,
    id_fam2 INT NOT NULL,
    id_fam1 INT NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_fam2),
    FOREIGN KEY (id_fam1) REFERENCES FAM1(id_fam1) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_fam1 (id_fam1),
    INDEX idx_libelle (libelle),
    INDEX idx_actif (actif)
) ENGINE=InnoDB;

CREATE TABLE ART (
    guid VARCHAR(36) NOT NULL,
    id_art INT NOT NULL,
    id_fam2 INT,
    id_tva INT NOT NULL,
    reference VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    prix_ht DECIMAL(10,3) NOT NULL,
    prix_ttc DECIMAL(10,3) NOT NULL,
    stock_actuel INT DEFAULT 0,
    stock_min INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_art),
    UNIQUE KEY (reference),
    FOREIGN KEY (id_fam2) REFERENCES FAM2(id_fam2) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_tva) REFERENCES TVA(id_tva) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_fam2 (id_fam2),
    INDEX idx_tva (id_tva),
    INDEX idx_libelle (libelle),
    INDEX idx_reference (reference),
    INDEX idx_actif (actif)
) ENGINE=InnoDB;

CREATE TABLE USER (
    guid VARCHAR(36) NOT NULL,
    id_user INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    role ENUM('admin', 'caissier', 'manager') DEFAULT 'caissier',
    actif BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_user),
    UNIQUE KEY (username),
    INDEX idx_role (role),
    INDEX idx_actif (actif)
) ENGINE=InnoDB;

CREATE TABLE PARAM (
    guid VARCHAR(36) NOT NULL,
    id_param INT NOT NULL,
    cle VARCHAR(100) NOT NULL,
    valeur TEXT NOT NULL,
    description TEXT,
    type_param ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_param),
    UNIQUE KEY (cle),
    INDEX idx_type (type_param)
) ENGINE=InnoDB;

CREATE TABLE TC (
    guid VARCHAR(36) NOT NULL,
    id_tc INT NOT NULL,
    id_user INT NOT NULL,
    numero_ticket VARCHAR(50) NOT NULL,
    date_heure TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant_ht DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    montant_tva DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    montant_ttc DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    montant_espece DECIMAL(10,2) DEFAULT 0.00,
    montant_cb DECIMAL(10,2) DEFAULT 0.00,
    montant_cheque DECIMAL(10,2) DEFAULT 0.00,
    montant_autre DECIMAL(10,2) DEFAULT 0.00,
    client_nom VARCHAR(100),
    client_info TEXT,
    annule BOOLEAN DEFAULT FALSE,
    motif_annulation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_tc),
    UNIQUE KEY (numero_ticket),
    FOREIGN KEY (id_user) REFERENCES USER(id_user) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_user (id_user),
    INDEX idx_date_heure (date_heure),
    INDEX idx_montant_ttc (montant_ttc),
    INDEX idx_annule (annule)
) ENGINE=InnoDB;

CREATE TABLE LINE (
    guid VARCHAR(36) NOT NULL,
    id_line INT NOT NULL,
    id_tc INT NOT NULL,
    id_art INT NOT NULL,
    id_tva INT NOT NULL,
    quantite DECIMAL(10,3) NOT NULL DEFAULT 1.000,
    prix_unitaire_ht DECIMAL(10,3) NOT NULL,
    prix_unitaire_ttc DECIMAL(10,3) NOT NULL,
    total_ht DECIMAL(10,2) NOT NULL,
    total_tva DECIMAL(10,2) NOT NULL,
    total_ttc DECIMAL(10,2) NOT NULL,
    remise_pourcent DECIMAL(5,2) DEFAULT 0.00,
    remise_montant DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_line),
    FOREIGN KEY (id_tc) REFERENCES TC(id_tc) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_art) REFERENCES ART(id_art) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_tva) REFERENCES TVA(id_tva) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_tc (id_tc),
    INDEX idx_art (id_art),
    INDEX idx_tva (id_tva)
) ENGINE=InnoDB;

CREATE TABLE FV (
    guid VARCHAR(36) NOT NULL,
    id_fv INT NOT NULL,
    id_tc INT NOT NULL,
    numero_facture VARCHAR(50) NOT NULL,
    date_facturation DATE NOT NULL,
    client_nom VARCHAR(100) NOT NULL,
    client_adresse TEXT,
    client_code_postal VARCHAR(20),
    client_ville VARCHAR(100),
    client_siret VARCHAR(20),
    client_tva_intra VARCHAR(20),
    montant_ht DECIMAL(10,2) NOT NULL,
    montant_tva DECIMAL(10,2) NOT NULL,
    montant_ttc DECIMAL(10,2) NOT NULL,
    reglee BOOLEAN DEFAULT FALSE,
    date_reglement DATE NULL,
    mode_reglement ENUM('espece', 'cb', 'cheque', 'virement', 'autre') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (guid),
    UNIQUE KEY (id_fv),
    UNIQUE KEY (numero_facture),
    FOREIGN KEY (id_tc) REFERENCES TC(id_tc) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tc (id_tc),
    INDEX idx_date_facturation (date_facturation),
    INDEX idx_client_nom (client_nom),
    INDEX idx_reglee (reglee)
) ENGINE=InnoDB;