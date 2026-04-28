# Guide d'installation - UMIFA Backend

Guide complet pour configurer le projet UMIFA Backend en local après clonage.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 18.x ([Télécharger](https://nodejs.org/))
- **PostgreSQL** >= 14.x ([Télécharger](https://www.postgresql.org/download/))
- **pgAdmin** (optionnel, pour visualiser la base) ([Télécharger](https://www.pgadmin.org/download/))
- **Git** ([Télécharger](https://git-scm.com/downloads))

## Installation étape par étape

### Cloner le projet

```bash
git clone https://github.com/rimvieMichee/umifa.git
cd umifa/umifa_back
```

### Installer les dépendances

```bash
npm install
```

### Configurer les variables d'environnement

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

**Éditer le fichier `.env` :**

```bash
# Remplace "username" par ton nom d'utilisateur système
# Sur Mac/Linux : utilise la commande "whoami" pour le trouver
DATABASE_URL="postgresql://TON_USERNAME@localhost:5432/umifa_db?schema=public"
JWT_SECRET="umifa-secret-key-dev-2026"
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV="development"
```

**Exemple :**

- Si ton username est `john`, utilise : `postgresql://john@localhost:5432/umifa_db?schema=public`
- Si ton username est `marie`, utilise : `postgresql://marie@localhost:5432/umifa_db?schema=public`

### Créer la base de données PostgreSQL

**Option A : Avec createdb (recommandé)**

```bash
createdb umifa_db
```

**Option B : Avec psql**

```bash
psql -U postgres
CREATE DATABASE umifa_db;
\q
```

**Option C : Avec pgAdmin**

1. Ouvre pgAdmin
2. Clic droit sur "Databases" → "Create" → "Database..."
3. Name: `umifa_db`
4. Save

### Générer le client Prisma

```bash
npm run prisma:generate
```

### Exécuter les migrations

```bash
npm run prisma:migrate
```

Quand demandé, entre un nom pour la migration (ex: `init`)

### Peupler la base avec des données de test

```bash
npm run prisma:seed
```

Cette commande créera :

- 3 utilisateurs de test
- 2 écoles (Medersa Al-Ihsan, Medersa An-Nour)
- 1 année scolaire (2025-2026)
- 2 centres d'examen (Paris Nord, Lyon Sud)
- 2 candidats (Ahmed, Fatima)

### Démarrer le serveur

```bash
npm run start:dev
```

Le serveur démarre sur : **http://localhost:3000/api**

---

## Configuration pgAdmin

Pour visualiser et gérer la base de données dans pgAdmin :

### Étape 1 : Ouvrir pgAdmin

### Étape 2 : Créer une nouvelle connexion

1. **Clic droit** sur "Servers" → **"Register"** → **"Server..."**

### Étape 3 : Configurer la connexion

**Onglet "General" :**

- **Name:** `UMIFA Local` (ou le nom de ton choix)

**Onglet "Connection" :**

- **Host name/address:** `localhost`
- **Port:** `5432`
- **Maintenance database:** `umifa_db`
- **Username:** `TON_USERNAME`  (utilise la commande `whoami` pour le trouver)
- **Password:** (laisse vide si pas de mot de passe configuré)
- **✓ Save password** (coche la case)

### Étape 4 : Sauvegarder

Clique sur **"Save"**

### Étape 5 : Explorer la base

Une fois connecté, navigue vers :

```
Servers → UMIFA Local → Databases → umifa_db → Schemas → public → Tables
```

Tu verras 7 tables :

- `users` - Utilisateurs du système
- `schools` - Écoles/Médersas
- `school_years` - Années scolaires
- `exam_centers` - Centres d'examen
- `candidates` - Candidats
- `grades` - Notes
- `_prisma_migrations` - Historique des migrations

---

## Comptes de test

Après le seed, tu peux te connecter avec :

| Email                | Mot de passe | Rôle           |
|----------------------|--------------|----------------|
| `admin@umifa.fr`     | `admin123`   | SUPER_ADMIN    |
| `manager@alihsan.fr` | `admin123`   | SCHOOL_MANAGER |
| `grader@umifa.fr`    | `admin123`   | GRADER         |

---

## Documentation API (Swagger)

Une fois le serveur démarré, accède à la documentation interactive :

**http://localhost:3000/api/docs**

### Comment tester l'API avec Swagger :

1. **Ouvre** http://localhost:3000/api/docs
2. **Teste le login :**
    - Clique sur `POST /api/auth/login`
    - Clique "Try it out"
    - Entre :
      ```json
      {
        "email": "admin@umifa.fr",
        "password": "admin123"
      }
      ```
    - Clique "Execute"
    - **Copie le token** (`access_token`) dans la réponse

3. **Authentifie-toi :**
    - Clique sur le bouton **"Authorize"** 🔓 en haut à droite
    - Entre : `Bearer <ton_token_copié>`
    - Clique "Authorize"

4. **Teste les autres endpoints** (candidates, schools, grades, etc.)

---

## Commandes utiles

```bash
# Démarrer le serveur en mode développement
npm run start:dev

# Démarrer le serveur en mode production
npm run build
npm run start:prod

# Voir la base de données avec Prisma Studio
npm run prisma:studio

# Créer une nouvelle migration
npm run prisma:migrate

# Réinitialiser la base de données
npx prisma migrate reset

# Formater le code
npm run format

# Linter le code
npm run lint

# Tests
npm run test
```

---

## Résolution des problèmes courants

### Erreur : "role 'postgres' does not exist"

**Cause :** Le fichier `.env` utilise `postgres` au lieu de ton username système.

**Solution :**

1. Trouve ton username : `whoami`
2. Édite `.env` et remplace `postgres` par ton username
3. Redémarre le serveur

### Erreur : "database 'umifa_db' does not exist"

**Solution :**

```bash
createdb umifa_db
```

### Erreur : "Cannot find module '@nestjs/mapped-types'"

**Solution :**

```bash
npm install @nestjs/mapped-types --legacy-peer-deps
```

### Le serveur ne démarre pas

**Solution :**

1. Vérifie que PostgreSQL est bien démarré
2. Vérifie que le port 3000 n'est pas déjà utilisé
3. Vérifie le fichier `.env`
4. Supprime `node_modules` et réinstalle : `rm -rf node_modules && npm install`

### Erreur de connexion à la base de données

**Solution :**

```bash
# Teste la connexion
psql -d umifa_db

# Si ça ne fonctionne pas, vérifie que PostgreSQL est démarré
# Mac :
brew services list
brew services start postgresql

# Linux :
sudo systemctl status postgresql
sudo systemctl start postgresql
```

---

## Support

Pour toute question ou problème :

- Consulte la documentation : [README.md](./README.md)
- Ouvre une issue sur GitHub
- Contacte l'équipe technique UMIFA

---

## Checklist de vérification

Avant de commencer à développer, assure-toi que :

- [ ] Node.js est installé (`node --version`)
- [ ] PostgreSQL est installé et démarré (`psql --version`)
- [ ] La base `umifa_db` est créée
- [ ] Le fichier `.env` est configuré avec ton username
- [ ] Les dépendances sont installées (`npm install`)
- [ ] Les migrations sont exécutées (`npm run prisma:migrate`)
- [ ] Les données de test sont insérées (`npm run prisma:seed`)
- [ ] Le serveur démarre sans erreur (`npm run start:dev`)
- [ ] Swagger est accessible (http://localhost:3000/api/docs)
- [ ] pgAdmin est connecté à la base (optionnel)

**Si tous les points sont cochés, tu es prêt à développer ! **
