# Déploiement avec base de données en ligne

## 1. Choisir un hébergeur de base de données

Recommandations simples :
- Railway
- Render
- PlanetScale
- Clever Cloud
- Aiven

Pour une solution rapide, le plus simple est souvent Railway ou Render avec une base MySQL.

## 2. Variables d’environnement à configurer

Dans l’hébergement du backend, définir :

```env
NODE_ENV=production
PORT=3000
DB_HOST=YOUR_DB_HOST
DB_PORT=3306
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
JWT_SECRET=change-this-secret
ALLOWED_ORIGINS=https://your-frontend-domain.com
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_TEST_MODE=false
```

## 3. Importer le schéma SQL

Une fois la base créée, importer le fichier :

```bash
mysql -u YOUR_DB_USER -p YOUR_DB_NAME < database/schema.sql
```

## 4. Déployer le backend

- Backend : Render / Railway / VPS
- Frontend : Vercel / Netlify / Cloudflare Pages

## 5. Configurer le frontend

Dans les variables d’environnement du frontend :

```env
REACT_APP_API_URL=https://YOUR_BACKEND_URL/api
```
