# UMIFA - Gestion du CEP Arabe

Système de gestion des examens du Certificat d'Études Primaires (CEP) Arabe pour l'Union des Medersas Islamiques Franco-Arabes.

## 📁 Structure du projet

Ce repository contient deux applications :

- **umifa_back/** - Backend API (NestJS + PostgreSQL + Prisma)
- **umifa_web/** - Frontend (Angular 20)

## 🚀 Déploiement

### Backend sur Render

Voir le guide détaillé : [umifa_back/DEPLOYMENT_QUICK_START.md](umifa_back/DEPLOYMENT_QUICK_START.md)

### Frontend sur Render

Instructions à venir.

## 💻 Développement local

### Backend
```bash
cd umifa_back
npm install
npm run start:dev
```

### Frontend
```bash
cd umifa_web
npm install
npm start
```

## 📚 Documentation

- Backend API : http://localhost:3000/api/docs (Swagger)
- Frontend : http://localhost:4200

## 🔑 Comptes de test

- **Super Admin** : admin@umifa.fr / admin123
- **Responsable** : manager@alihsan.fr / admin123
- **Correcteur** : grader@umifa.fr / admin123
