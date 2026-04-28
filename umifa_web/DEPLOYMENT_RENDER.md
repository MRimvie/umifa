# 🚀 Déploiement Frontend UMIFA sur Render

## 📋 Configuration du Frontend

### 1. Créer le Web Service sur Render

1. Va sur https://dashboard.render.com
2. Clique sur **"New +"** → **"Static Site"**
3. Connecte ton repository Git : **https://github.com/MRimvie/umifa**
4. Sélectionne le repository **umifa**

### 2. Configuration du service

Remplis les champs suivants **EXACTEMENT** comme indiqué :

- **Name** : `umifa-web`
- **Region** : `Frankfurt`
- **Branch** : `main`
- **Root Directory** : **LAISSE VIDE**
- **Build Command** :
  ```bash
  cd umifa_web && npm install && npm run build
  ```
- **Publish Directory** :
  ```
  umifa_web/dist/umifa_web/browser
  ```

### 3. Variables d'environnement

Aucune variable d'environnement n'est nécessaire pour le frontend. L'URL de l'API backend est configurée dans le fichier `environment.prod.ts`.

### 4. Déploiement

1. Clique sur **"Create Static Site"**
2. Attends que le déploiement se termine (5-10 minutes)
3. Une fois déployé, ton frontend sera accessible sur : `https://umifa-web.onrender.com`

## ✅ Vérification

Après le déploiement :

1. Accède à `https://umifa-web.onrender.com`
2. Tu devrais voir la page de connexion
3. Le frontend communiquera avec le backend sur `https://umifa-backend.onrender.com/api`

## 🔑 Comptes de test

Les comptes suivants seront créés via le seed :

- **Super Admin** : `admin@umifa.fr` / `admin123`
- **Responsable école** : `manager@alihsan.fr` / `admin123`
- **Correcteur** : `grader@umifa.fr` / `admin123`

## 🐛 Dépannage

### Le frontend ne se connecte pas au backend

Vérifie que :
1. Le backend est bien déployé sur `https://umifa-backend.onrender.com`
2. Le fichier `src/environments/environment.prod.ts` contient la bonne URL
3. Les CORS sont bien configurés dans le backend pour accepter `https://umifa-web.onrender.com`

### Erreur de build

Si le build échoue, vérifie :
1. Que la commande de build est correcte
2. Que le `Publish Directory` pointe vers `umifa_web/dist/umifa_web/browser`
