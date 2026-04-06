# 🚀 Déploiement UMIFA Backend sur Render

Ce guide détaille les étapes pour déployer l'application backend UMIFA sur [Render.com](https://render.com).

## 📋 Prérequis

- Un compte Render (gratuit ou payant)
- Un repository Git (GitHub, GitLab, ou Bitbucket)
- Le code backend UMIFA poussé sur le repository

## 🗄️ Étape 1 : Créer une base de données PostgreSQL

1. **Connectez-vous à Render** : https://dashboard.render.com

2. **Créer une nouvelle base de données PostgreSQL** :
   - Cliquez sur **"New +"** → **"PostgreSQL"**
   - Remplissez les informations :
     - **Name** : `umifa-db` (ou votre choix)
     - **Database** : `umifa`
     - **User** : `umifa_user` (généré automatiquement)
     - **Region** : Choisir la région la plus proche (ex: Frankfurt pour l'Europe)
     - **PostgreSQL Version** : 16 (ou la dernière version)
     - **Plan** : Free (pour commencer) ou Starter ($7/mois)

3. **Créer la base de données** :
   - Cliquez sur **"Create Database"**
   - Attendez quelques minutes que la base soit provisionnée

4. **Récupérer les informations de connexion** :
   - Une fois créée, allez dans l'onglet **"Info"**
   - Notez les informations suivantes :
     - **Internal Database URL** (pour Render services)
     - **External Database URL** (pour connexions externes)
     - **PSQL Command** (pour se connecter en ligne de commande)

## 🌐 Étape 2 : Créer le Web Service

1. **Créer un nouveau Web Service** :
   - Cliquez sur **"New +"** → **"Web Service"**
   - Connectez votre repository Git

2. **Configurer le service** :
   - **Name** : `umifa-backend`
   - **Region** : Même région que la base de données
   - **Branch** : `main` (ou votre branche de production)
   - **Root Directory** : `umifa_back` (si votre backend est dans un sous-dossier)
   - **Runtime** : `Node`
   - **Build Command** : 
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command** :
     ```bash
     npx prisma migrate deploy && npm run start:prod
     ```
   - **Plan** : Free (pour commencer) ou Starter ($7/mois)

## 🔐 Étape 3 : Configurer les variables d'environnement

Dans la section **"Environment"** du Web Service, ajoutez les variables suivantes :

### Variables obligatoires :

```bash
# Base de données (copier l'Internal Database URL de votre PostgreSQL)
DATABASE_URL=postgresql://umifa_user:password@hostname/umifa

# JWT Secret (générer une clé secrète forte)
JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe_ici

# Port (Render utilise automatiquement la variable PORT)
PORT=3000

# Node Environment
NODE_ENV=production

# URL du frontend (pour CORS)
FRONTEND_URL=https://votre-frontend-umifa.onrender.com
```

### Comment générer un JWT_SECRET sécurisé :

```bash
# Sur votre machine locale, exécutez :
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📦 Étape 4 : Préparer le code pour la production

### 4.1 Créer un fichier `render.yaml` (optionnel mais recommandé)

Créez un fichier `render.yaml` à la racine de votre projet :

```yaml
services:
  - type: web
    name: umifa-backend
    runtime: node
    region: frankfurt
    plan: free
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npx prisma migrate deploy && npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: umifa-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 3000

databases:
  - name: umifa-db
    databaseName: umifa
    user: umifa_user
    region: frankfurt
    plan: free
```

### 4.2 Vérifier le fichier `package.json`

Assurez-vous que votre `package.json` contient les scripts nécessaires :

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 4.3 Mettre à jour le fichier `main.ts` pour CORS

Vérifiez que votre fichier `src/main.ts` gère correctement CORS :

```typescript
app.enableCors({
  origin: [
    'http://localhost:4200',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
});
```

## 🚀 Étape 5 : Déployer

1. **Pousser votre code sur Git** :
   ```bash
   git add .
   git commit -m "Préparer le déploiement sur Render"
   git push origin main
   ```

2. **Render déploiera automatiquement** :
   - Le build commence automatiquement
   - Suivez les logs en temps réel dans le dashboard
   - Le déploiement prend environ 5-10 minutes

3. **Vérifier le déploiement** :
   - Une fois terminé, votre API sera accessible sur : `https://umifa-backend.onrender.com`
   - Testez l'endpoint de santé : `https://umifa-backend.onrender.com/api`
   - Accédez à Swagger : `https://umifa-backend.onrender.com/api/docs`

## 🔄 Étape 6 : Initialiser la base de données

### 6.1 Exécuter les migrations Prisma

Les migrations sont automatiquement exécutées au démarrage grâce à la commande :
```bash
npx prisma migrate deploy
```

### 6.2 Créer les données initiales (seed)

Pour créer les utilisateurs de test, connectez-vous via le Shell Render :

1. Dans votre Web Service, allez dans **"Shell"**
2. Exécutez :
   ```bash
   npm run seed
   ```

Ou créez un utilisateur admin manuellement via Prisma Studio ou SQL.

## 📊 Étape 7 : Surveillance et logs

### Voir les logs :
- Dans le dashboard Render, onglet **"Logs"**
- Les logs sont en temps réel

### Métriques :
- Onglet **"Metrics"** pour voir :
  - CPU usage
  - Memory usage
  - Request count
  - Response times

## 🔧 Dépannage

### Problème : Build échoue

**Solution** : Vérifiez les logs de build et assurez-vous que :
- Toutes les dépendances sont dans `package.json`
- Les commandes de build sont correctes
- Node version est compatible (>=18)

### Problème : Erreur de connexion à la base de données

**Solution** :
- Vérifiez que `DATABASE_URL` est correctement configurée
- Utilisez l'**Internal Database URL** (pas External)
- Vérifiez que la base de données est dans la même région

### Problème : Migrations Prisma échouent

**Solution** :
```bash
# Dans le Shell Render, exécutez :
npx prisma migrate reset --force
npx prisma migrate deploy
npm run seed
```

### Problème : CORS errors

**Solution** :
- Ajoutez l'URL de votre frontend dans `FRONTEND_URL`
- Vérifiez la configuration CORS dans `main.ts`

## 💰 Coûts

### Plan Free (Gratuit) :
- ✅ 750 heures/mois
- ✅ 512 MB RAM
- ✅ PostgreSQL 1 GB storage
- ⚠️ Service s'endort après 15 min d'inactivité
- ⚠️ Redémarrage lent (30-60 secondes)

### Plan Starter ($7/mois par service) :
- ✅ Toujours actif (pas de sommeil)
- ✅ 512 MB RAM
- ✅ Déploiements plus rapides
- ✅ PostgreSQL 10 GB storage

## 🔄 Mises à jour automatiques

Render redéploie automatiquement à chaque push sur la branche configurée (ex: `main`).

Pour désactiver le déploiement automatique :
- Allez dans **Settings** → **Build & Deploy**
- Désactivez **"Auto-Deploy"**

## 🌍 Domaine personnalisé

Pour utiliser votre propre domaine (ex: `api.umifa.fr`) :

1. Allez dans **Settings** → **Custom Domains**
2. Ajoutez votre domaine
3. Configurez les DNS chez votre registrar :
   - Type : `CNAME`
   - Name : `api` (ou `@` pour le domaine racine)
   - Value : `umifa-backend.onrender.com`

## ✅ Checklist finale

- [ ] Base de données PostgreSQL créée
- [ ] Variables d'environnement configurées
- [ ] `DATABASE_URL` correctement définie
- [ ] `JWT_SECRET` généré et configuré
- [ ] Code poussé sur Git
- [ ] Web Service créé et déployé
- [ ] Migrations exécutées avec succès
- [ ] Données de seed créées
- [ ] API accessible et fonctionnelle
- [ ] Swagger documentation accessible
- [ ] Frontend configuré avec la nouvelle URL API

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Render + NestJS](https://render.com/docs/deploy-nestjs)
- [Render + PostgreSQL](https://render.com/docs/databases)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**🎉 Votre backend UMIFA est maintenant déployé sur Render !**

URL de l'API : `https://umifa-backend.onrender.com/api`  
Swagger : `https://umifa-backend.onrender.com/api/docs`
