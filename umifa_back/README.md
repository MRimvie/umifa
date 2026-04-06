# UMIFA Backend - API de gestion du CEP Arabe

Backend NestJS avec Prisma et PostgreSQL pour la gestion complète de l'examen CEP Arabe de l'UMIFA.

## 🚀 Technologies

- **NestJS** - Framework Node.js progressif
- **Prisma** - ORM moderne pour TypeScript
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification par tokens
- **bcrypt** - Hachage des mots de passe
- **class-validator** - Validation des données

## 📋 Prérequis

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm ou yarn

## 🛠️ Installation

**📖 Pour un guide d'installation détaillé, consultez [SETUP.md](./SETUP.md)**

### Installation rapide

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env et remplacer "username" par votre nom d'utilisateur système
# Utilisez la commande "whoami" pour le trouver
# DATABASE_URL="postgresql://VOTRE_USERNAME@localhost:5432/umifa_db?schema=public"

# Créer la base de données
createdb umifa_db

# Générer le client Prisma
npm run prisma:generate

# Créer les tables (migrations)
npm run prisma:migrate

# Peupler avec des données de test
npm run prisma:seed
```

## 🎯 Démarrage

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod

# Prisma Studio (interface graphique pour la BDD)
npm run prisma:studio
```

L'API sera accessible sur `http://localhost:3000/api`

## � Documentation API (Swagger)

Une documentation interactive complète est disponible via Swagger UI :

👉 **http://localhost:3000/api/docs**

**Guide complet d'utilisation :** [SWAGGER.md](./SWAGGER.md)

### Fonctionnalités Swagger :
- ✅ Documentation interactive de tous les endpoints
- ✅ Exemples de données pré-remplis pour chaque requête
- ✅ Test direct des API depuis le navigateur
- ✅ Authentification JWT intégrée
- ✅ Schémas de données détaillés
- ✅ Codes d'erreur documentés

### Démarrage rapide :
1. Ouvrez http://localhost:3000/api/docs
2. Testez le login avec un compte de test
3. Copiez le token JWT
4. Cliquez sur "Authorize" et collez le token
5. Testez tous les endpoints !

## �📚 Structure du projet

```
src/
├── auth/              # Authentification (JWT, stratégies)
├── users/             # Gestion des utilisateurs
├── schools/           # Gestion des écoles/médersas
├── school-years/      # Gestion des années scolaires
├── exam-centers/      # Gestion des centres d'examen
├── candidates/        # Gestion des candidats
├── grades/            # Gestion des notes
├── prisma/            # Service Prisma
├── common/            # Guards, decorators, etc.
├── app.module.ts      # Module principal
└── main.ts            # Point d'entrée
```

## 👥 Rôles et permissions

### SUPER_ADMIN
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs, écoles, centres
- Attribution des numéros PV
- Répartition des candidats

### SCHOOL_MANAGER
- Inscription des candidats de son école
- Consultation des candidats de son école

### GRADER
- Saisie des notes pour son centre
- Calcul des résultats

### VIEWER
- Consultation uniquement

## 🔐 Authentification

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@umifa.fr",
  "password": "password123"
}
```

### Utilisation du token
```http
GET /api/candidates
Authorization: Bearer <votre_token_jwt>
```

## 📡 Endpoints principaux

### Authentification
- `POST /api/auth/login` - Connexion

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `GET /api/users/:id` - Détails d'un utilisateur
- `PATCH /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Écoles
- `GET /api/schools` - Liste des écoles
- `POST /api/schools` - Créer une école
- `GET /api/schools/:id` - Détails d'une école
- `PATCH /api/schools/:id` - Modifier une école
- `DELETE /api/schools/:id` - Supprimer une école

### Années scolaires
- `GET /api/school-years` - Liste des années
- `GET /api/school-years/active` - Année active
- `POST /api/school-years` - Créer une année
- `PATCH /api/school-years/:id` - Modifier une année

### Centres d'examen
- `GET /api/exam-centers` - Liste des centres
- `POST /api/exam-centers` - Créer un centre
- `GET /api/exam-centers/:id` - Détails d'un centre
- `PATCH /api/exam-centers/:id` - Modifier un centre

### Candidats
- `GET /api/candidates` - Liste des candidats (avec filtres)
- `POST /api/candidates` - Inscrire un candidat
- `POST /api/candidates/bulk` - Inscription en masse
- `POST /api/candidates/assign-center` - Affecter à un centre
- `POST /api/candidates/generate-pv/:schoolYearId` - Générer les numéros PV
- `GET /api/candidates/:id` - Détails d'un candidat
- `PATCH /api/candidates/:id` - Modifier un candidat
- `DELETE /api/candidates/:id` - Supprimer un candidat

### Notes
- `GET /api/grades` - Liste des notes (avec filtres)
- `POST /api/grades` - Saisir une note
- `POST /api/grades/bulk` - Saisie en masse
- `POST /api/grades/calculate/:candidateId` - Calculer les résultats
- `PATCH /api/grades/:id` - Modifier une note

## 🔄 Workflow typique

1. **Configuration initiale** (SUPER_ADMIN)
   - Créer l'année scolaire
   - Créer les écoles
   - Créer les centres d'examen
   - Créer les utilisateurs

2. **Inscription** (SCHOOL_MANAGER)
   - Inscrire les candidats de l'école

3. **Répartition** (SUPER_ADMIN)
   - Affecter les candidats aux centres
   - Générer les numéros PV

4. **Examen et notation** (GRADER)
   - Saisir les notes par centre

5. **Résultats** (GRADER/SUPER_ADMIN)
   - Calculer les moyennes et résultats

## 🗄️ Modèle de données

### User
- Utilisateurs du système avec rôles

### School
- Écoles/Médersas membres de l'UMIFA

### SchoolYear
- Années scolaires avec statuts (INSCRIPTION, REPARTITION, EXAMEN, CLOTURE)

### ExamCenter
- Centres d'examen avec capacité

### Candidate
- Candidats avec numéro PV automatique

### Grade
- Notes par matière avec calcul automatique des résultats

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```

## 📝 Variables d'environnement

```env
DATABASE_URL=postgresql://user:password@localhost:5432/umifa_db
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🤝 Contribution

1. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
2. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
3. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
4. Ouvrir une Pull Request

## 📄 Licence

Propriété de l'UMIFA - Tous droits réservés

## 📞 Support

Pour toute question, contactez l'équipe technique UMIFA.
# umifa
# umifa
# umifa
# umifa
