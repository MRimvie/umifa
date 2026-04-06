# 🎓 UMIFA Web - Frontend Application

Application web moderne pour la gestion du CEP Arabe (Certificat d'Études Primaires) de l'Union des Medersas Islamiques Franco-Arabes.

## 🚀 Technologies

- **Angular 20** - Framework frontend moderne avec architecture standalone
- **TypeScript** - Langage typé pour plus de robustesse
- **TailwindCSS** - Framework CSS utilitaire pour un design moderne
- **RxJS** - Programmation réactive
- **Signals** - Gestion d'état réactive d'Angular
- **SSR** - Server-Side Rendering pour de meilleures performances

## ✨ Fonctionnalités

### 🔐 Authentification
- Connexion sécurisée avec JWT
- Gestion des sessions
- Guards de protection des routes
- Intercepteur HTTP automatique

### 👥 Gestion des Utilisateurs
- 4 rôles : Super Admin, Responsable d'école, Correcteur, Observateur
- Permissions granulaires par rôle
- Profil utilisateur

### 📚 Modules Principaux
- **Dashboard** - Vue d'ensemble avec statistiques
- **Candidats** - Inscription et gestion des candidats
- **Notes** - Saisie et calcul des résultats
- **Écoles** - Gestion des médersas
- **Centres d'examen** - Configuration des centres
- **Années scolaires** - Gestion des sessions

## 📋 Prérequis

- Node.js >= 18.x
- npm >= 9.x
- Angular CLI 20.x

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
# Vérifier src/environments/environment.ts
# Par défaut, l'API backend est sur http://localhost:3000/api
```

## 🎯 Démarrage

### Mode développement

```bash
# Démarrer le serveur de développement
npm start
# ou
ng serve

# L'application sera accessible sur http://localhost:4200
```

### Mode production

```bash
# Build de production
npm run build

# Les fichiers seront dans dist/umifa-web/browser/
```

## 🔑 Comptes de Test

Pour tester l'application, utilisez ces comptes :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@umifa.fr | admin123 |
| Responsable École | manager@alihsan.fr | admin123 |
| Correcteur | grader@umifa.fr | admin123 |

## 📁 Structure du Projet

```
src/
├── app/
│   ├── core/                    # Services et fonctionnalités core
│   │   ├── guards/              # Guards de navigation
│   │   ├── interceptors/        # Intercepteurs HTTP
│   │   ├── models/              # Modèles de données
│   │   └── services/            # Services métier
│   ├── layouts/                 # Layouts de l'application
│   │   └── main-layout/         # Layout principal avec sidebar
│   ├── pages/                   # Pages de l'application
│   │   ├── login/               # Page de connexion
│   │   ├── dashboard/           # Tableau de bord
│   │   ├── candidates/          # Gestion candidats
│   │   ├── grades/              # Gestion notes
│   │   ├── schools/             # Gestion écoles
│   │   ├── exam-centers/        # Gestion centres
│   │   ├── school-years/        # Gestion années
│   │   └── users/               # Gestion utilisateurs
│   ├── shared/                  # Composants partagés
│   │   └── components/
│   │       └── sidebar/         # Menu latéral
│   ├── app.routes.ts            # Configuration des routes
│   └── app.config.ts            # Configuration de l'application
├── environments/                # Variables d'environnement
└── styles.scss                  # Styles globaux

```

## 🎨 Design System

### Couleurs Principales
- **Primary** : Bleu (#0ea5e9)
- **Secondary** : Violet (#d946ef)
- **Success** : Vert
- **Danger** : Rouge

### Classes Utilitaires TailwindCSS
- `.btn-primary` - Bouton principal
- `.btn-secondary` - Bouton secondaire
- `.card` - Carte avec ombre
- `.input-field` - Champ de formulaire

### Animations
- `animate-fade-in` - Apparition en fondu
- `animate-slide-in` - Glissement horizontal
- `animate-slide-up` - Glissement vertical
- `animate-scale-in` - Zoom progressif

## 🔒 Sécurité

- **JWT Authentication** - Tokens sécurisés
- **Route Guards** - Protection des routes
- **Role-based Access** - Contrôle d'accès par rôle
- **HTTP Interceptor** - Injection automatique du token

## 🌐 API Backend

L'application communique avec le backend NestJS via l'API REST :

**URL par défaut** : `http://localhost:3000/api`

Pour changer l'URL de l'API, modifiez `src/environments/environment.ts`

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers seront générés dans `dist/umifa-web/browser/`

### Serveur de production

```bash
# Avec un serveur HTTP simple
npx http-server dist/umifa-web/browser -p 8080

# Ou avec nginx, configurez le root vers dist/umifa-web/browser
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests e2e
npm run e2e
```

## 📚 Documentation

### Services Principaux

- **AuthService** - Gestion de l'authentification
- **ApiService** - Communication avec l'API
- **CandidateService** - Gestion des candidats
- **GradeService** - Gestion des notes
- **SchoolService** - Gestion des écoles/centres/années

### Guards

- **authGuard** - Vérifie l'authentification
- **roleGuard** - Vérifie les permissions par rôle

## 🤝 Contribution

1. Créer une branche feature
2. Faire vos modifications
3. Tester localement
4. Créer une Pull Request

## 📄 Licence

© 2026 UMIFA - Union des Medersas Islamiques Franco-Arabes

## 🆘 Support

Pour toute question ou problème :
- Consultez la documentation du backend : `../umifa_back/README.md`
- Vérifiez que le backend est bien démarré sur le port 3000
- Vérifiez les variables d'environnement

---

**Développé avec ❤️ pour l'UMIFA**
# umifa_web
