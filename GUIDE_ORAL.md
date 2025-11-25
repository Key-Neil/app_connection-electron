# 🚀 Keynect - Documentation pour Examen Oral

## 📋 Vue d'ensemble du projet

**Keynect** est une application de livraison de repas construite avec **Electron** et **Prisma**.

### Technologies utilisées
- **Electron 31.2.1** : Framework pour créer des applications desktop avec JavaScript
- **Prisma ORM 5.22.0** : Gestion de base de données MySQL
- **TypeScript 5.9** : Typage statique pour JavaScript
- **bcryptjs** : Hachage sécurisé des mots de passe

---

## 🏗️ Architecture simplifiée

Le projet est organisé de manière **linéaire et lisible** pour faciliter la compréhension :

```
src/
├── main/
│   ├── main.ts              ← TOUT LE CODE BACKEND ICI (800+ lignes)
│   ├── prisma/
│   │   ├── schema.prisma    ← Définition de la base de données
│   │   ├── seed.ts          ← Données de démonstration
│   │   └── migrations/
│   │       └── 20251125021812_init/  ← Migration unique et propre
│   └── utilitaires/
│       ├── prisma.ts        ← Client Prisma
│       └── auth.ts          ← Fonctions d'authentification
├── renderer/
│   ├── index.html           ← Interface utilisateur
│   ├── index.css            ← Styles CSS
│   └── renderer.ts          ← Logique frontend
└── preload/
    └── preload.ts           ← Pont sécurisé Electron IPC
```

### Principe de l'architecture
**Tout le code backend est dans `main.ts`** - pas de fichiers séparés pour les contrôleurs !

**Flux de données :**
```
Frontend (renderer.ts) 
    → IPC (preload.ts) 
        → Backend (main.ts) 
            → Base de données (Prisma)
```

---

## 🗄️ Base de données - Structure

### Modèles principaux

#### 1. **Utilisateur**
```typescript
id_utilisateur, nom, prenom, email, mot_de_passe_hash
```
- Peut avoir plusieurs rôles : Client, Cuisinier, Livreur, Admin

#### 2. **Restaurant**
```typescript
id_restaurant, nom, adresse, telephone, latitude, longitude
```
- Contient des sections de menu et des produits

#### 3. **SectionMenu**
```typescript
id_section, nom, description, ordre, id_restaurant
```
- Organise les produits par catégories (ex: Burgers, Accompagnements)

#### 4. **Produit**
```typescript
id_produit, nom, prix, description, url_photo, prix_promo, 
id_section, id_restaurant
```

#### 5. **Commande**
```typescript
id_commande, date_commande, statut, id_client, id_restaurant
```
- Lien avec **DetailCommande** (table de jointure)

#### 6. **Livraison**
```typescript
id_livraison, id_commande, id_livreur, statut_livraison,
heure_acceptation, heure_livraison_effective
```

### Relations entre les tables
- **Utilisateur** ↔ **Role** : Many-to-Many via `UtilisateurRole`
- **Utilisateur** ↔ **Restaurant** : Many-to-Many via `StaffRestaurant`
- **Restaurant** → **SectionMenu** → **Produit** : One-to-Many
- **Commande** ↔ **Produit** : Many-to-Many via `DetailCommande`
- **Commande** → **Livraison** : One-to-One

---

## 🔧 Fonctionnalités implémentées

### 1. Authentification
```typescript
ipcMain.handle('auth:register', async (event, data) => {
  // Créer un compte utilisateur
  // Hacher le mot de passe avec bcrypt
  // Attribuer le rôle "Client" par défaut
})

ipcMain.handle('auth:login', async (event, data) => {
  // Vérifier email + mot de passe
  // Retourner les informations utilisateur + rôles
})
```

### 2. Gestion des restaurants (Admin)
```typescript
ipcMain.handle('admin:createRestaurant', ...)
ipcMain.handle('admin:updateRestaurant', ...)
ipcMain.handle('admin:deleteRestaurant', ...)
```

### 3. Gestion des menus (Admin)
```typescript
// Sections de menu
ipcMain.handle('admin:createSection', ...)
ipcMain.handle('admin:updateSection', ...)
ipcMain.handle('admin:deleteSection', ...)

// Produits
ipcMain.handle('admin:createProduit', ...)
ipcMain.handle('admin:updateProduit', ...)
ipcMain.handle('admin:deleteProduit', ...)
```

### 4. Commandes (Client)
```typescript
ipcMain.handle('commande:create', async (event, userId, payload) => {
  // Créer une commande avec détails
  // Calculer les prix automatiquement
})

ipcMain.handle('commande:getForClient', async (event, userId) => {
  // Récupérer toutes les commandes d'un client
})
```

### 5. Préparation (Cuisinier)
```typescript
ipcMain.handle('commande:getForCook', async (event, userId) => {
  // Si Cuisinier global : voir toutes les commandes
  // Sinon : voir uniquement les commandes de ses restaurants
})

ipcMain.handle('commande:updateStatus', async (event, userId, commandeId, statut) => {
  // Changer le statut : "En attente" → "En préparation" → "Prête"
})
```

### 6. Livraisons (Livreur)
```typescript
ipcMain.handle('livraison:getAvailableCommandes', ...) // Commandes "Prête"
ipcMain.handle('livraison:create', ...) // Accepter une livraison
ipcMain.handle('livraison:updateStatus', ...) // "Acceptée" → "En cours" → "Livrée"
```

### 7. Administration (Admin)
```typescript
ipcMain.handle('admin:getUsers', ...) // Liste tous les utilisateurs
ipcMain.handle('admin:setRoles', ...) // Attribuer des rôles
ipcMain.handle('admin:addStaffToRestaurant', ...) // Lier un cuisinier à un resto
ipcMain.handle('admin:getAllCommandes', ...) // Voir toutes les commandes
```

---

## 🔐 Sécurité

### Hachage des mots de passe
```typescript
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
```

### Vérification des rôles
```typescript
async function userHasAnyRole(userId: number, allowedRoles: string[]): Promise<boolean> {
  // Récupère les rôles de l'utilisateur
  // Vérifie s'il a au moins un des rôles requis
}
```

### Validation des accès
Chaque handler vérifie :
- L'utilisateur est-il connecté ?
- A-t-il les droits nécessaires ?
- Est-ce bien sa commande / son restaurant ?

---

## 📊 Migration unique et propre

Au lieu d'avoir 8+ migrations fragmentées, le projet a maintenant **une seule migration `init`** :

```
src/main/prisma/migrations/
└── 20251125021812_init/
    └── migration.sql
```

Cela rend le projet **plus professionnel** et **facile à déployer** sur une nouvelle machine :
```bash
npx prisma migrate deploy
```

---

## 🌱 Données de démonstration

Le fichier `seed.ts` crée automatiquement :
- ✅ 4 rôles : Client, Cuisinier, Livreur, Admin
- ✅ 1 compte admin : **admin@keynect.com** / **admin123**
- ✅ 2 restaurants : "Le Burger Royal" et "Pizza Paradise"
- ✅ 3 sections de menu : Burgers, Accompagnements, Pizzas
- ✅ 8 produits avec noms, prix, descriptions

Pour réinitialiser la base :
```bash
npx prisma migrate reset --schema src/main/prisma/schema.prisma
```

---

## 🚀 Lancement du projet

### Installation
```bash
npm install
```

### Génération Prisma Client
```bash
npx prisma generate --schema src/main/prisma/schema.prisma
```

### Migration + Seed
```bash
npx prisma migrate dev --schema src/main/prisma/schema.prisma
```

### Compilation TypeScript
```bash
npm run build
```

### Lancer l'application
```bash
npm start
```

---

## 💡 Points clés pour l'oral

### 1. Architecture linéaire
> "J'ai consolidé tout le code backend dans un seul fichier `main.ts` pour faciliter la lecture et la compréhension. Chaque handler IPC appelle directement Prisma sans passer par des contrôleurs séparés."

### 2. Pattern IPC
> "Le pattern de communication est simple : le frontend envoie une requête via `window.api.functionName()`, le preload expose l'API de manière sécurisée, et le backend traite avec `ipcMain.handle()`."

### 3. Base de données normalisée
> "J'ai utilisé des tables de jointure explicites (`UtilisateurRole`, `StaffRestaurant`, `DetailCommande`) plutôt que les relations implicites de Prisma pour mieux comprendre la structure."

### 4. Sécurité
> "Tous les mots de passe sont hachés avec bcryptjs (10 rounds de salage). Chaque handler vérifie les permissions avant d'exécuter une action."

### 5. Migration unique
> "J'ai recréé une migration initiale propre au lieu de garder l'historique fragmenté. Cela simplifie le déploiement et rend le projet plus professionnel."

### 6. Try/Catch partout
> "Tous les handlers asynchrones ont des blocs try/catch pour capturer les erreurs et retourner des messages clairs au frontend."

---

## 📁 Fichiers importants à montrer

1. **`src/main/main.ts`** (800+ lignes) : Tout le backend
2. **`src/main/prisma/schema.prisma`** : Structure de la base
3. **`src/renderer/renderer.ts`** : Logique frontend
4. **`package.json`** : Configuration du projet
5. **`src/main/prisma/seed.ts`** : Données de test

---

## ✅ Ce qui fonctionne

- ✅ Inscription et connexion
- ✅ Navigation entre restaurants
- ✅ Ajout au panier et commande
- ✅ Tableau de bord admin (utilisateurs, commandes, restaurants)
- ✅ Gestion complète des menus (sections + produits)
- ✅ Système de rôles (Client, Cuisinier, Livreur, Admin)
- ✅ Livraisons assignables aux livreurs
- ✅ Mise à jour des statuts de commandes
- ✅ Compilation TypeScript sans erreurs

---

## 🎓 Conclusion

Ce projet démontre :
- **Maîtrise d'Electron** : Communication IPC sécurisée
- **Maîtrise de Prisma** : Modélisation relationnelle, migrations, queries
- **Bonnes pratiques** : Hachage des mots de passe, validation des accès, gestion d'erreurs
- **Architecture claire** : Code linéaire et lisible pour l'oral
- **Base de données normalisée** : Relations Many-to-Many explicites

**Points forts :**
- Code consolidé et facile à expliquer
- Migration unique et professionnelle
- Système de rôles flexible
- Sécurité des données utilisateurs

Bonne chance pour ton oral ! 🚀
