# ⚠️ Configuration Manuelle Render - IMPORTANT

## 🚨 Problème

Render utilise la configuration du **dashboard** et non le fichier `render.yaml` pour les services existants.

Les logs montrent encore `npx prisma` au lieu de `./node_modules/.bin/prisma`, ce qui installe Prisma 7 au lieu de 5.8.0.

## ✅ Solution : Mettre à jour manuellement sur Render

### Étape 1 : Aller dans les Settings

1. Va sur https://dashboard.render.com
2. Sélectionne ton service **umifa-backend**
3. Clique sur **Settings** (dans le menu de gauche)

### Étape 2 : Modifier Build & Deploy

1. Scroll jusqu'à la section **Build & Deploy**
2. Clique sur **Edit** à côté de "Build Command"

### Étape 3 : Mettre à jour les commandes

**Root Directory** : **Laisse complètement VIDE** (ne rien mettre)

**Build Command** : Copie-colle EXACTEMENT cette commande :
```bash
cd umifa_back && npm install --legacy-peer-deps && ./node_modules/.bin/prisma generate && npm run build
```

**Start Command** : Copie-colle EXACTEMENT cette commande :
```bash
cd umifa_back && ./node_modules/.bin/prisma migrate deploy && npm run start:prod
```

### Étape 4 : Sauvegarder

1. Clique sur **Save Changes** en bas de la page
2. Attends que la sauvegarde soit confirmée

### Étape 5 : Redéployer

1. En haut de la page, clique sur **Manual Deploy**
2. Sélectionne **Deploy latest commit**
3. Attends le déploiement (5-10 minutes)

## 🔍 Vérification

Dans les logs de build, tu devrais maintenant voir :
```
==> Running build command 'cd umifa_back && npm install --legacy-peer-deps && ./node_modules/.bin/prisma generate && npm run build'...
```

Et **PAS** :
```
==> Running build command 'cd umifa_back && npm install --legacy-peer-deps && npx prisma generate && npm run build'...
```

## ✅ Checklist

- [ ] Settings → Build & Deploy ouvert
- [ ] Root Directory vide
- [ ] Build Command avec `./node_modules/.bin/prisma generate`
- [ ] Start Command avec `./node_modules/.bin/prisma migrate deploy`
- [ ] Changes sauvegardées
- [ ] Manual Deploy lancé
- [ ] Logs vérifient que `./node_modules/.bin/prisma` est utilisé

## 🎯 Résultat attendu

Une fois les commandes mises à jour, le build devrait :
1. ✅ Installer Prisma 5.8.0 (pas 7.x)
2. ✅ Utiliser le binaire local Prisma 5.8.0
3. ✅ Générer Prisma Client sans erreur
4. ✅ Build NestJS avec succès
5. ✅ Exécuter les migrations
6. ✅ Démarrer le serveur

---

**⚠️ IMPORTANT : Le fichier `render.yaml` n'est utilisé que lors de la création INITIALE du service. Pour un service existant, tu DOIS modifier manuellement sur le dashboard.**
