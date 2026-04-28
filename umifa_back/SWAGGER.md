# 📚 Documentation Swagger - UMIFA API

Guide complet d'utilisation de la documentation Swagger interactive pour l'API UMIFA.

## 🌐 Accès à Swagger

Une fois le serveur démarré, accédez à la documentation interactive :

👉 **http://localhost:3000/api/docs**

## 🔐 Authentification

### Étape 1 : Se connecter

1. **Ouvrez l'endpoint** `POST /api/auth/login`
2. **Cliquez sur** "Try it out"
3. **Sélectionnez un exemple** dans la liste déroulante :
   - Super Administrateur
   - Responsable d'école
   - Correcteur
4. **Cliquez sur** "Execute"
5. **Copiez le token** dans la réponse (champ `access_token`)

### Étape 2 : S'authentifier dans Swagger

1. **Cliquez sur le bouton** 🔓 **"Authorize"** en haut à droite
2. **Entrez** : `Bearer <votre_token_copié>`
3. **Cliquez sur** "Authorize"
4. **Fermez** la fenêtre

✅ Vous êtes maintenant authentifié ! Tous les endpoints protégés sont accessibles.

---

## 📋 Exemples de données par module

### 🔑 Authentification (`/api/auth`)

#### Login - Super Admin
```json
{
  "email": "admin@umifa.fr",
  "password": "admin123"
}
```

#### Login - Responsable d'école
```json
{
  "email": "manager@alihsan.fr",
  "password": "admin123"
}
```

#### Login - Correcteur
```json
{
  "email": "grader@umifa.fr",
  "password": "admin123"
}
```

**Réponse attendue :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@umifa.fr",
    "firstName": "Admin",
    "lastName": "UMIFA",
    "role": "SUPER_ADMIN"
  }
}
```

---

### 🏫 Écoles (`/api/schools`)

#### Créer une école
```json
{
  "name": "Medersa Al-Ihsan",
  "address": "123 Rue de la Paix, Paris 75001",
  "phone": "01 23 45 67 89",
  "email": "contact@alihsan.fr",
  "contactName": "Directeur Al-Ihsan"
}
```

#### Autre exemple
```json
{
  "name": "Medersa An-Nour",
  "address": "456 Avenue des Lumières, Lyon 69001",
  "phone": "04 56 78 90 12",
  "email": "contact@annour.fr",
  "contactName": "Directeur An-Nour"
}
```

---

### 📅 Années scolaires (`/api/school-years`)

#### Créer une année scolaire
```json
{
  "year": "2025-2026",
  "startDate": "2025-09-01",
  "endDate": "2026-06-30",
  "status": "INSCRIPTION"
}
```

**Statuts disponibles :**
- `INSCRIPTION` - Phase d'inscription des candidats
- `REPARTITION` - Répartition dans les centres
- `EXAMEN` - Période d'examen
- `CLOTURE` - Année clôturée

---

### 🏢 Centres d'examen (`/api/exam-centers`)

#### Créer un centre
```json
{
  "name": "Centre Paris Nord",
  "address": "789 Boulevard du Nord, Paris 75018",
  "capacity": 100,
  "phone": "01 98 76 54 32"
}
```

#### Autre exemple
```json
{
  "name": "Centre Lyon Sud",
  "address": "321 Rue du Sud, Lyon 69007",
  "capacity": 80,
  "phone": "04 12 34 56 78"
}
```

---

### 👨‍🎓 Candidats (`/api/candidates`)

#### Inscrire un candidat (garçon)
```json
{
  "firstName": "Ahmed",
  "lastName": "Benali",
  "gender": "MASCULIN",
  "dateOfBirth": "2010-05-15",
  "placeOfBirth": "Paris",
  "nationality": "Française",
  "schoolId": "550e8400-e29b-41d4-a716-446655440000",
  "schoolYearId": "660e8400-e29b-41d4-a716-446655440001"
}
```

#### Inscrire un candidat (fille)
```json
{
  "firstName": "Fatima",
  "lastName": "Zahra",
  "gender": "FEMININ",
  "dateOfBirth": "2010-08-22",
  "placeOfBirth": "Lyon",
  "nationality": "Française",
  "schoolId": "550e8400-e29b-41d4-a716-446655440000",
  "schoolYearId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Genres disponibles :**
- `MASCULIN`
- `FEMININ`

#### Inscription en masse (`POST /api/candidates/bulk`)
```json
[
  {
    "firstName": "Ahmed",
    "lastName": "Benali",
    "gender": "MASCULIN",
    "dateOfBirth": "2010-05-15",
    "placeOfBirth": "Paris",
    "nationality": "Française",
    "schoolId": "550e8400-e29b-41d4-a716-446655440000",
    "schoolYearId": "660e8400-e29b-41d4-a716-446655440001"
  },
  {
    "firstName": "Fatima",
    "lastName": "Zahra",
    "gender": "FEMININ",
    "dateOfBirth": "2010-08-22",
    "placeOfBirth": "Lyon",
    "nationality": "Française",
    "schoolId": "550e8400-e29b-41d4-a716-446655440000",
    "schoolYearId": "660e8400-e29b-41d4-a716-446655440001"
  }
]
```

#### Affecter des candidats à un centre (`POST /api/candidates/assign-center`)
```json
{
  "candidateIds": [
    "770e8400-e29b-41d4-a716-446655440002",
    "770e8400-e29b-41d4-a716-446655440003"
  ],
  "centerId": "880e8400-e29b-41d4-a716-446655440003"
}
```

#### Générer les numéros PV (`POST /api/candidates/generate-pv/:schoolYearId`)

Remplacez `:schoolYearId` par l'ID de l'année scolaire.

**Exemple :** `/api/candidates/generate-pv/660e8400-e29b-41d4-a716-446655440001`

**Réponse :**
```json
{
  "message": "15 numéros PV générés avec succès",
  "count": 15
}
```

Les numéros PV sont générés au format : `2026001`, `2026002`, `2026003`, etc.

---

### 📝 Notes (`/api/grades`)

#### Saisir une note
```json
{
  "candidateId": "770e8400-e29b-41d4-a716-446655440002",
  "subject": "Langue Arabe",
  "score": 15.5
}
```

#### Matières courantes
- Langue Arabe
- Sciences Islamiques
- Mathématiques
- Histoire-Géographie
- Sciences

#### Saisie en masse (`POST /api/grades/bulk`)
```json
[
  {
    "candidateId": "770e8400-e29b-41d4-a716-446655440002",
    "subject": "Langue Arabe",
    "score": 15.5
  },
  {
    "candidateId": "770e8400-e29b-41d4-a716-446655440002",
    "subject": "Sciences Islamiques",
    "score": 16
  },
  {
    "candidateId": "770e8400-e29b-41d4-a716-446655440002",
    "subject": "Mathématiques",
    "score": 14
  }
]
```

#### Calculer les résultats (`POST /api/grades/calculate/:candidateId`)

Remplacez `:candidateId` par l'ID du candidat.

**Exemple :** `/api/grades/calculate/770e8400-e29b-41d4-a716-446655440002`

**Réponse :**
```json
{
  "candidateId": "770e8400-e29b-41d4-a716-446655440002",
  "totalScore": 45.5,
  "average": 15.17,
  "result": "ADMIS",
  "gradesCount": 3
}
```

**Résultats possibles :**
- `ADMIS` - Moyenne >= 10
- `AJOURNE` - Moyenne < 10
- `EN_ATTENTE` - Notes non encore saisies

---

### 👥 Utilisateurs (`/api/users`)

#### Créer un responsable d'école
```json
{
  "email": "nouveau.manager@umifa.fr",
  "password": "password123",
  "firstName": "Nouveau",
  "lastName": "Responsable",
  "role": "SCHOOL_MANAGER",
  "schoolId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Créer un correcteur
```json
{
  "email": "correcteur@umifa.fr",
  "password": "password123",
  "firstName": "Correcteur",
  "lastName": "Centre",
  "role": "GRADER",
  "centerId": "880e8400-e29b-41d4-a716-446655440003"
}
```

#### Créer un super admin
```json
{
  "email": "admin2@umifa.fr",
  "password": "password123",
  "firstName": "Admin",
  "lastName": "Secondaire",
  "role": "SUPER_ADMIN"
}
```

**Rôles disponibles :**
- `SUPER_ADMIN` - Accès complet
- `SCHOOL_MANAGER` - Gestion des candidats de son école
- `GRADER` - Saisie des notes de son centre
- `VIEWER` - Consultation uniquement

---

## 🔍 Filtres et recherches

### Candidats

**GET** `/api/candidates?schoolYearId=xxx&schoolId=yyy&centerId=zzz`

Exemples :
- Tous les candidats d'une école : `/api/candidates?schoolId=550e8400-e29b-41d4-a716-446655440000`
- Tous les candidats d'un centre : `/api/candidates?centerId=880e8400-e29b-41d4-a716-446655440003`
- Tous les candidats d'une année : `/api/candidates?schoolYearId=660e8400-e29b-41d4-a716-446655440001`

### Notes

**GET** `/api/grades?candidateId=xxx&centerId=yyy`

Exemples :
- Notes d'un candidat : `/api/grades?candidateId=770e8400-e29b-41d4-a716-446655440002`
- Notes d'un centre : `/api/grades?centerId=880e8400-e29b-41d4-a716-446655440003`

---

## 🎯 Workflow complet

### 1. Configuration initiale (SUPER_ADMIN)

```bash
# 1. Se connecter
POST /api/auth/login

# 2. Créer l'année scolaire
POST /api/school-years

# 3. Créer les écoles
POST /api/schools

# 4. Créer les centres d'examen
POST /api/exam-centers

# 5. Créer les utilisateurs (responsables, correcteurs)
POST /api/users
```

### 2. Inscription des candidats (SCHOOL_MANAGER)

```bash
# 1. Se connecter
POST /api/auth/login

# 2. Inscrire les candidats
POST /api/candidates
# ou en masse
POST /api/candidates/bulk
```

### 3. Répartition (SUPER_ADMIN)

```bash
# 1. Affecter les candidats aux centres
POST /api/candidates/assign-center

# 2. Générer les numéros PV
POST /api/candidates/generate-pv/:schoolYearId
```

### 4. Saisie des notes (GRADER)

```bash
# 1. Se connecter
POST /api/auth/login

# 2. Saisir les notes
POST /api/grades
# ou en masse
POST /api/grades/bulk

# 3. Calculer les résultats
POST /api/grades/calculate/:candidateId
```

---

## 💡 Astuces Swagger

### Copier les exemples
- Cliquez sur un exemple dans la liste déroulante
- Les données sont automatiquement remplies
- Modifiez selon vos besoins

### Tester rapidement
- Utilisez "Try it out" sur chaque endpoint
- Les réponses s'affichent directement
- Les codes d'erreur sont documentés

### Garder l'authentification
- Swagger garde votre token en mémoire
- Pas besoin de se reconnecter à chaque test
- Option "Persist authorization" activée

### Voir les schémas
- Cliquez sur "Schemas" en bas de page
- Voir tous les modèles de données
- Comprendre la structure des objets

---

## ❌ Codes d'erreur courants

| Code | Description | Solution |
|------|-------------|----------|
| 401 | Non authentifié | Se connecter et utiliser le token |
| 403 | Accès refusé | Vérifier les permissions du rôle |
| 404 | Ressource non trouvée | Vérifier l'ID utilisé |
| 409 | Conflit (doublon) | Vérifier les données uniques (email, nom) |
| 400 | Données invalides | Vérifier le format des données |

---

## 📖 Ressources

- **API Documentation** : http://localhost:3000/api/docs
- **README** : [README.md](./README.md)
- **Guide d'installation** : [SETUP.md](./SETUP.md)
- **Schéma Prisma** : [prisma/schema.prisma](./prisma/schema.prisma)

---

## 🆘 Besoin d'aide ?

Si un endpoint ne fonctionne pas :
1. Vérifiez que vous êtes authentifié (token valide)
2. Vérifiez que votre rôle a les permissions nécessaires
3. Vérifiez le format des données (respecter les exemples)
4. Consultez les messages d'erreur détaillés dans la réponse

**Bon test de l'API ! 🚀**
