# 🚀 Déploiement Rapide UMIFA Backend sur Render

## ✅ Configuration avec ta base de données existante

Tu as déjà une base de données PostgreSQL gratuite sur Render : `moni_db_wxyz`

## 📝 Étapes de déploiement

### 1. Créer le Web Service sur Render

1. Va sur https://dashboard.render.com
2. Clique sur **"New +"** → **"Web Service"**
3. Connecte ton repository Git : **https://github.com/MRimvie/umifa**
4. Sélectionne le repository **umifa**

### 2. Configuration du service

⚠️ **IMPORTANT** : Ton repository a cette structure :
```
umifa/
├── umifa_back/    ← Backend ici
└── umifa_web/     ← Frontend ici
```

Remplis les champs suivants **EXACTEMENT** comme indiqué :

- **Name** : `umifa-backend`
- **Region** : `Frankfurt` (même région que ta base de données)
- **Branch** : `main`
- **Root Directory** : **LAISSE VIDE** (ne rien mettre, très important !)
- **Runtime** : `Node`
- **Build Command** :
  ```bash
  cd umifa_back && npm install && npx prisma generate && npm run build
  ```
- **Start Command** :
  ```bash
  cd umifa_back && npx prisma migrate deploy && npm run start:prod
  ```
- **Plan** : `Free`

### 3. Variables d'environnement

Dans la section **Environment**, ajoute ces variables :

#### DATABASE_URL
```
postgresql://moni_user:2LFqOyGLakY1J2yWl0zlagX8rIselxlX@dpg-d77tdms50q8c73d28pbg-a.frankfurt-postgres.render.com/moni_db_wxyz
```

#### JWT_SECRET
Génère une clé secrète forte :
```bash
# Sur ta machine locale, exécute :
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copie le résultat et colle-le comme valeur de `JWT_SECRET`

#### NODE_ENV
```
production
```

#### PORT
```
10000
```

#### FRONTEND_URL (optionnel pour l'instant)
```
http://localhost:4200
```
(Tu mettras à jour avec l'URL du frontend une fois déployé)

### 4. Créer le service

Clique sur **"Create Web Service"**

Render va :
1. ✅ Cloner ton repository
2. ✅ Installer les dépendances
3. ✅ Générer Prisma Client
4. ✅ Build l'application NestJS
5. ✅ Exécuter les migrations Prisma
6. ✅ Démarrer le serveur

⏱️ **Temps estimé** : 5-10 minutes

### 5. Vérifier le déploiement

Une fois le déploiement terminé :

1. **Récupère l'URL** : `https://umifa-backend.onrender.com`
2. **Teste l'API** : 
   - Ouvre `https://umifa-backend.onrender.com/api`
   - Tu devrais voir une réponse JSON
3. **Accède à Swagger** :
   - Ouvre `https://umifa-backend.onrender.com/api/docs`
   - Tu verras la documentation interactive

### 6. Initialiser les données

Pour créer les utilisateurs de test :

1. Dans le dashboard Render, va sur ton service `umifa-backend`
2. Clique sur **"Shell"** (en haut à droite)
3. Exécute :
   ```bash
   npm run seed
   ```

Cela créera les 3 utilisateurs de test :
- **admin@umifa.fr** / admin123 (Super Admin)
- **manager@alihsan.fr** / admin123 (Responsable)
- **grader@umifa.fr** / admin123 (Correcteur)

### 7. Tester l'authentification

Teste la connexion avec curl ou Postman :

```bash
curl -X POST https://umifa-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@umifa.fr","password":"admin123"}'
```

Tu devrais recevoir un token JWT en réponse.

## 🎯 URLs finales

- **API** : `https://umifa-backend.onrender.com/api`
- **Swagger** : `https://umifa-backend.onrender.com/api/docs`
- **Health Check** : `https://umifa-backend.onrender.com/api`

## ⚠️ Important - Plan gratuit

Avec le plan gratuit Render :
- ✅ 750 heures/mois
- ✅ 512 MB RAM
- ⚠️ Le service **s'endort après 15 minutes** d'inactivité
- ⚠️ Premier appel après sommeil : **30-60 secondes** de délai

Pour éviter le sommeil, upgrade vers **Starter** ($7/mois).

## 🔄 Mises à jour automatiques

Render redéploie automatiquement à chaque push sur la branche `main`.

Pour désactiver :
- Settings → Build & Deploy → Désactiver "Auto-Deploy"

## 📊 Monitoring

Dans le dashboard Render :
- **Logs** : Voir les logs en temps réel
- **Metrics** : CPU, RAM, requêtes
- **Events** : Historique des déploiements

## 🔧 Dépannage

### Problème : Build échoue
**Solution** : Vérifie les logs de build, assure-toi que toutes les dépendances sont dans `package.json`

### Problème : Migrations Prisma échouent
**Solution** : Dans le Shell, exécute :
```bash
npx prisma migrate reset --force
npx prisma migrate deploy
npm run seed
```

### Problème : Erreur 503 Service Unavailable
**Solution** : Le service est en train de démarrer (sommeil). Attends 30-60 secondes.

## ✅ Checklist

- [ ] Web Service créé sur Render
- [ ] Variables d'environnement configurées
- [ ] `DATABASE_URL` avec ta base existante
- [ ] `JWT_SECRET` généré et configuré
- [ ] Service déployé avec succès
- [ ] Migrations exécutées
- [ ] Données de seed créées
- [ ] API accessible et fonctionnelle
- [ ] Swagger documentation accessible
- [ ] Test de connexion réussi

## 🎉 Prochaines étapes

1. **Déployer le frontend** Angular sur Render
2. **Mettre à jour** `FRONTEND_URL` avec l'URL du frontend
3. **Configurer** un domaine personnalisé (optionnel)
4. **Upgrade** vers Starter si besoin de performances

---

**Ton backend UMIFA est maintenant en production ! 🚀**
