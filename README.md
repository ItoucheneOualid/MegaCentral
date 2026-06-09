# 🏢 MEGA-Central - Système de Gestion Commerciale

**Projet de fin d'études** - Système centralisé de gestion des ventes, articles et factures pour commerces multi-magasins.

## 📋 Table des matières

- [À propos](#à-propos)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [Documentation](#documentation)
- [Structure du projet](#structure-du-projet)

---

## 🎯 À propos

MEGA-Central est une application web complète permettant de :

✅ **Consulter le tableau de bord** avec KPI et statistiques temps réel  
✅ **Gérer les articles** avec recherche et pagination  
✅ **Consulter les tickets** de caisse  
✅ **Gérer les factures** avec export PDF/Excel  
✅ **Consulter les familles d'articles**  
✅ **Exporter les données** en PDF et Excel  

---

## 🏗️ Architecture

```
MEGA-Central/
├── backend/              # API REST Node.js + Express
│   ├── src/
│   │   ├── controllers/  # Logique métier
│   │   ├── routes/       # Endpoints API
│   │   ├── services/     # Services et business logic
│   │   ├── middleware/   # Middleware Express
│   │   ├── config/       # Configuration
│   │   ├── types/        # Types TypeScript
│   │   └── scripts/      # Scripts utiles
│   ├── .env              # Variables d'environnement
│   └── package.json      # Dépendances Node.js
│
├── frontend/             # Application React
│   ├── src/
│   │   ├── pages/        # Pages React
│   │   ├── components/   # Composants réutilisables
│   │   ├── services/     # Services API
│   │   ├── contexts/     # Contextes React
│   │   ├── types/        # Types TypeScript
│   │   └── utils/        # Utilitaires
│   ├── .env              # Variables d'environnement
│   └── package.json      # Dépendances Node.js
│
├── database/             # Schémas base de données
│   └── schema.sql        # Schéma MySQL complet
│
├── docs/                 # Documentation
│   ├── CAHIER_DES_CHARGES.md   # Cahier des charges officiel
│   └── CAHIER_DES_CHARGES.pdf  # Version PDF
│
└── README.md             # Ce fichier
```

---

## 📋 Prérequis

- **Node.js** v14+ ([télécharger](https://nodejs.org/))
- **MySQL** 5.7+ (WAMP/XAMPP recommandé)
- **npm** ou **yarn**

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd MegaCentral
```

### 2. Configurer la base de données

1. Ouvrir **WAMP/XAMPP** et démarrer **MySQL**
2. Importer le schéma :
   ```bash
   mysql -u root < database/schema.sql
   ```
3. La base de données `idmegacentral` est créée avec toutes les tables

### 3. Installer les dépendances backend

```bash
cd backend
npm install
```

### 4. Configurer les variables d'environnement backend

Créer/éditer `backend/.env` :
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=idmegacentral

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-passe-app
EMAIL_TEST_MODE=false
```

### 5. Installer les dépendances frontend

```bash
cd ../frontend
npm install
```

### 6. Configurer les variables d'environnement frontend

Créer/éditer `frontend/.env` :
```
PORT=3001
REACT_APP_API_URL=http://localhost:3000
```

---

## ▶️ Démarrage

### Terminal 1 - Backend (API)

```bash
cd backend
npm run dev
```

✅ Backend prêt sur `http://localhost:3000`

### Terminal 2 - Frontend (Interface)

```bash
cd frontend
npm start
```

✅ Frontend accessible sur `http://localhost:3001`

---

## 📖 Documentation

Consultez le [Cahier des charges](./docs/CAHIER_DES_CHARGES.md) pour :

- 📋 Fonctionnalités complètes
- 🎯 Exigences techniques
- 📊 Spécifications fonctionnelles
- 🔒 Sécurité et authentification

---

## 📁 Structure détaillée

### Backend (`/backend/src`)

```
controllers/      → Logique métier par module
├── articles.ts   → Gestion articles
├── tickets.ts    → Gestion tickets
├── invoices.ts   → Gestion factures
└── families.ts   → Gestion familles

routes/          → Endpoints API
└── index.ts      → Définition des routes

services/        → Services métier
└── databaseService.ts → Connexion MySQL

middleware/      → Middleware Express
├── auth.ts       → Authentification
└── errorHandler.ts → Gestion erreurs

config/          → Configuration
└── database.ts   → Config MySQL
```

### Frontend (`/frontend/src`)

```
pages/           → Pages React
├── Dashboard.tsx
├── Articles.tsx
├── Tickets.tsx
├── Invoices.tsx
└── Families.tsx

components/      → Composants réutilisables
├── Tables/
├── Forms/
└── UI/

services/        → Services API
└── apiClient.ts  → Client HTTP

contexts/        → Contextes React
└── AuthContext.tsx → Authentification
```

---

## 🔧 Scripts disponibles

### Backend

```bash
npm run dev       # Démarrage en développement
npm run build     # Compilation TypeScript
npm run serve     # Exécution en production
npm run test      # Tests unitaires
npm run lint      # Vérification code
```

### Frontend

```bash
npm start         # Démarrage en développement
npm run build     # Production build
npm run test      # Tests
npm run eject     # Éject (irréversible)
```

---

## 🛠️ Stack technologique

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Typage statique
- **MySQL2** - Driver MySQL
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React** - UI library
- **TypeScript** - Typage statique
- **Material-UI** - Composants UI
- **Axios** - Client HTTP
- **React Router** - Navigation
- **jsPDF** - Export PDF
- **XLSX** - Export Excel

### Base de données
- **MySQL** - SGBDR relational
- **Schéma normalisé** - Optimisé pour performances

---

## 📝 Licence

MIT - Projet académique

---

## 📞 Support

Pour toute question ou problème, consultez le cahier des charges ou contactez l'équipe de développement.

---

**Dernière mise à jour:** Mai 2026  
**Version:** 1.0.0
