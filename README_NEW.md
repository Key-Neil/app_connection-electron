# 🚀 Keynect

**Application de livraison de repas** construite avec Electron, Prisma et TypeScript.

## 📦 Technologies

- **Electron 31.2.1** - Framework desktop multi-plateforme
- **Prisma 5.22.0** - ORM moderne pour MySQL
- **TypeScript 5.9** - Typage statique JavaScript
- **bcryptjs** - Hachage sécurisé des mots de passe

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate --schema src/main/prisma/schema.prisma

# Créer la base de données et insérer les données de test
npx prisma migrate dev --schema src/main/prisma/schema.prisma

# Compiler le TypeScript
npm run build

# Lancer l'application
npm start
```

## 🗄️ Base de données

Le projet utilise une base MySQL avec les tables suivantes :
- **Utilisateurs** : Comptes avec système de rôles
- **Restaurants** : Établissements avec géolocalisation
- **SectionMenu** : Catégories de produits (ex: Burgers, Desserts)
- **Produits** : Articles avec prix et descriptions
- **Commandes** : Historique des achats clients
- **Livraisons** : Suivi des courses livreurs

## 👤 Compte de test

**Email :** admin@keynect.com  
**Mot de passe :** admin123  
**Rôles :** Admin (accès complet)

## 🏗️ Architecture

```
src/
├── main/
│   ├── main.ts              ← Backend complet (IPC handlers + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma    ← Modèles de données
│   │   ├── seed.ts          ← Données de démonstration
│   │   └── migrations/      ← Migration unique "init"
│   └── utilitaires/
│       ├── prisma.ts        ← Client Prisma singleton
│       └── auth.ts          ← Helpers authentification
├── renderer/
│   ├── index.html           ← Interface utilisateur
│   ├── index.css            ← Styles
│   └── renderer.ts          ← Logique frontend
└── preload/
    └── preload.ts           ← Pont IPC sécurisé
```

## ✨ Fonctionnalités

### Pour tous
- ✅ Inscription et connexion sécurisées
- ✅ Navigation entre restaurants
- ✅ Consultation des menus par sections

### Client
- ✅ Ajout au panier
- ✅ Passer une commande
- ✅ Suivi de ses commandes

### Cuisinier
- ✅ Voir les commandes de ses restaurants
- ✅ Mettre à jour les statuts (En préparation, Prête)

### Livreur
- ✅ Voir les commandes disponibles
- ✅ Accepter une livraison
- ✅ Mettre à jour le statut (En cours, Livrée)

### Admin
- ✅ Gérer les utilisateurs et leurs rôles
- ✅ CRUD restaurants complet
- ✅ CRUD sections de menu
- ✅ CRUD produits
- ✅ Voir toutes les commandes
- ✅ Rattacher des cuisiniers aux restaurants

## 🔐 Sécurité

- Mots de passe hachés avec **bcryptjs** (10 rounds)
- Vérification des rôles sur chaque action sensible
- Contexte Electron isolé (`contextIsolation: true`)
- Communication IPC sécurisée via preload script

## 📝 Scripts disponibles

```bash
npm run build      # Compile TypeScript
npm run clean      # Supprime le dossier dist
npm run rebuild    # Clean + Build
npm start          # Build + Lance Electron
npm run seed       # Réexécute le seed (données de test)
```

## 📚 Documentation

Voir **[GUIDE_ORAL.md](./GUIDE_ORAL.md)** pour une documentation complète destinée à la présentation orale.

## 📄 Licence

ISC - Projet scolaire par Key_Neil
