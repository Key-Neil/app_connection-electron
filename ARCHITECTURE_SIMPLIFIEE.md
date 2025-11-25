# 📚 GUIDE DE LA NOUVELLE ARCHITECTURE SIMPLIFIÉE

## 🎯 Objectif de la refactorisation

Ce projet a été **radicalement simplifié** pour faciliter l'apprentissage et la compréhension d'Electron + Prisma. L'architecture est maintenant **minimaliste** tout en restant fonctionnelle.

---

## 📁 Nouvelle structure des fichiers

```
Connextion-app-electron/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données (inchangé)
│   ├── seed.ts                # Données de test
│   └── migrations/            # Historique des migrations
│
├── src/
│   ├── main/
│   │   ├── main.ts           ⭐ TOUT LE BACKEND ICI (1000+ lignes)
│   │   └── utilitaires/
│   │       └── prisma.ts      # Instance Prisma uniquement
│   │
│   ├── preload/
│   │   └── preload.ts        ⭐ Exposition API (window.auth + window.api)
│   │
│   ├── renderer/
│   │   ├── index.html        ⭐ SPA UNIQUE avec toutes les vues
│   │   ├── index.css          # Styles
│   │   └── renderer.ts       ⭐ TOUT LE FRONTEND ICI (900+ lignes)
│   │
│   └── types/
│       └── global.d.ts        # Types TypeScript pour window.auth/api
│
├── package.json
├── tsconfig.json
├── build.ts
└── forge.config.js
```

### ✅ Ce qui a été SUPPRIMÉ :
- ❌ `src/main/controleurs/` (adminController, authController, etc.)
- ❌ Tous les fichiers HTML spécifiques (admin.html, cuisinier.html, etc.)
- ❌ Tous les fichiers TS spécifiques (admin.ts, cuisinier.ts, etc.)
- ❌ `menu.ts` (navigation intégrée dans renderer.ts)

---

## 🏗️ Architecture détaillée

### 1️⃣ **Backend : `src/main/main.ts`** (≈1000 lignes)

**Contenu complet :**
- ✅ Création de la fenêtre Electron
- ✅ Fonctions utilitaires (hashPassword, comparePasswords, userHasAnyRole)
- ✅ IPC Handlers pour :
  - **Authentification** : register, login
  - **Restaurants** : getAll, add, delete, update
  - **Produits** : addProduit, updateProduit, deleteProduit
  - **Sections** : addSection, updateSection, deleteSection
  - **Commandes (client)** : create, getForClient
  - **Commandes (cuisinier)** : getForCook, updateStatus
  - **Livraisons (livreur)** : getForLivreur, getAvailableCommandes, create, updateStatus
  - **Administration** : getRoles, getUsers, setRoles, addStaffToRestaurant, removeStaffFromRestaurant

**Organisation du code :**
```typescript
// ============================================================
// AUTHENTIFICATION - Inscription & Connexion
// ============================================================
ipcMain.handle('auth:register', async (event, data) => {
  // Logique directement ici avec Prisma
});

// ============================================================
// RESTAURANTS - Récupération, Ajout, Suppression
// ============================================================
ipcMain.handle('restaurant:getAll', async () => {
  // Logique directement ici avec Prisma
});
```

**Avantages :**
- ✅ Tout est au même endroit → facile à lire de haut en bas
- ✅ Commentaires pédagogiques en français
- ✅ Pas besoin de naviguer entre fichiers

---

### 2️⃣ **Preload : `src/preload/preload.ts`** (≈150 lignes)

**Contenu :**
- Exposition de `window.auth` (register, login)
- Exposition de `window.api` (toutes les autres fonctions)

**Exemple :**
```typescript
contextBridge.exposeInMainWorld('auth', {
  register: (data: any) => ipcRenderer.invoke('auth:register', data),
  login: (data: any) => ipcRenderer.invoke('auth:login', data),
});

contextBridge.exposeInMainWorld('api', {
  getAllRestaurants: () => ipcRenderer.invoke('restaurant:getAll'),
  createCommande: (userId, payload) => ipcRenderer.invoke('commande:create', userId, payload),
  // ... etc
});
```

**Avantages :**
- ✅ Clair et exhaustif
- ✅ Commentaires sur chaque groupe de fonctions

---

### 3️⃣ **Frontend HTML : `src/renderer/index.html`** (≈200 lignes)

**Contenu : Single Page Application (SPA)**

Toutes les vues sont dans le même fichier, cachées/affichées avec `display:none/block` :

```html
<!-- Navigation (masquée au login) -->
<nav id="nav-bar" style="display:none;">
  <button id="nav-restaurants">Restaurants</button>
  <button id="nav-commandes">Mes Commandes</button>
  <button id="nav-cook">Cuisinier</button>
  <button id="nav-livreur">Livreur</button>
  <button id="nav-admin">Admin</button>
  <button id="nav-logout">Déconnexion</button>
</nav>

<!-- Vue: Connexion/Inscription -->
<div id="view-login" class="view" style="display:block;">
  <!-- Formulaires login + register -->
</div>

<!-- Vue: Restaurants -->
<div id="view-restaurants" class="view" style="display:none;">
  <div id="restaurants-list"></div>
  <div id="cart-section"></div> <!-- Panier -->
</div>

<!-- Vue: Mes Commandes -->
<div id="view-commandes" class="view" style="display:none;">
  <div id="commandes-list"></div>
</div>

<!-- Vue: Cuisinier -->
<div id="view-cook" class="view" style="display:none;">
  <div id="cook-restaurants"></div>
  <div id="cook-commandes"></div>
</div>

<!-- Vue: Livreur -->
<div id="view-livreur" class="view" style="display:none;">
  <div id="livreur-livraisons"></div>
  <div id="livreur-available"></div>
</div>

<!-- Vue: Admin -->
<div id="view-admin" class="view" style="display:none;">
  <div id="admin-users"></div>
  <!-- Selects pour attach/detach -->
</div>

<script src="renderer.js"></script>
```

**Avantages :**
- ✅ Une seule page → pas de rechargement
- ✅ Navigation fluide par JavaScript
- ✅ Toutes les interfaces au même endroit

---

### 4️⃣ **Frontend JavaScript : `src/renderer/renderer.ts`** (≈900 lignes)

**Contenu complet :**

#### État global
```typescript
let currentUser: any = null;  // Utilisateur connecté
let cart: Array<...> = [];    // Panier d'achat
let selectedRestaurantId: number | null = null;
```

#### Fonctions de navigation (SPA)
```typescript
function showView(viewId: string) {
  // Cache toutes les vues, affiche celle demandée
}

function showNavBar() {
  // Affiche la nav avec boutons selon rôles
}
```

#### Gestion par rôle
- **Authentification** : `handleLogin()`, `handleRegister()`, `handleLogout()`
- **Client** : `loadRestaurants()`, `addToCart()`, `validateCart()`, `loadClientCommandes()`
- **Cuisinier** : `loadCookRestaurants()`, `loadCookCommandes()`, `attachCookStatusEvents()`
- **Livreur** : `loadLivreurLivraisons()`, `loadLivreurAvailableCommandes()`, `attachLivreurAcceptEvents()`
- **Admin** : `loadAdmin()`, `attachAdminRoleEvents()`, `handleAttachStaff()`, `handleDetachStaff()`

#### Initialisation
```typescript
document.addEventListener('DOMContentLoaded', () => {
  // Attacher TOUS les événements au démarrage
  document.getElementById('login-submit')?.addEventListener('click', handleLogin);
  document.getElementById('nav-restaurants')?.addEventListener('click', () => {
    showView('view-restaurants');
    loadRestaurants();
  });
  // ... etc
});
```

**Avantages :**
- ✅ Tout le code frontend dans un seul fichier
- ✅ Facile de suivre le flux : événement → fonction → API → affichage
- ✅ Commentaires expliquant chaque section

---

## 🚀 Utilisation

### Commandes disponibles

```bash
# Installer les dépendances
npm install

# Compiler le TypeScript
npm run build

# Lancer l'application
npm start

# Créer les exécutables Windows
npm run make
```

### Workflow typique

1. **Modifier `src/main/main.ts`** → Ajouter/modifier un IPC handler
2. **Modifier `src/preload/preload.ts`** → Exposer la nouvelle fonction
3. **Modifier `src/types/global.d.ts`** → Ajouter le type TypeScript
4. **Modifier `src/renderer/renderer.ts`** → Appeler la fonction depuis le frontend
5. **`npm run build && npm start`** → Tester

---

## 📖 Concepts Electron expliqués

### Processus Main (Backend)
- Fichier : `src/main/main.ts`
- Rôle : Gère Electron, la fenêtre, les IPC handlers, et Prisma
- Accès : Node.js, système de fichiers, base de données

### Processus Preload (Pont)
- Fichier : `src/preload/preload.ts`
- Rôle : Expose de manière sécurisée les APIs du Main au Renderer
- Technique : `contextBridge.exposeInMainWorld()`

### Processus Renderer (Frontend)
- Fichiers : `src/renderer/index.html` + `renderer.ts`
- Rôle : Interface utilisateur (HTML/CSS/JS)
- Accès : Uniquement ce qui est exposé par le Preload

**Communication :**
```
Renderer (renderer.ts)
   ↓ appelle window.api.createCommande()
Preload (preload.ts)
   ↓ ipcRenderer.invoke('commande:create')
Main (main.ts)
   ↓ ipcMain.handle('commande:create')
   ↓ Prisma.commande.create()
```

---

## 🎓 Conseils pour apprendre

1. **Lire le code de haut en bas** dans `main.ts` → tout est là !
2. **Suivre un flux complet** : Login → API → DB → Retour → Affichage
3. **Modifier petit à petit** : Changer un texte, ajouter un bouton, etc.
4. **Utiliser les commentaires** : Ils expliquent chaque section

### Exemple de flux complet : Créer une commande

1. **Frontend** (`renderer.ts`) :
   ```typescript
   async function validateCart() {
     const result = await window.api.createCommande(currentUser.id, payload);
   }
   ```

2. **Preload** (`preload.ts`) :
   ```typescript
   createCommande: (userId, payload) => 
     ipcRenderer.invoke('commande:create', userId, payload),
   ```

3. **Backend** (`main.ts`) :
   ```typescript
   ipcMain.handle('commande:create', async (event, userId, payload) => {
     const created = await prisma.commande.create({ data: {...} });
     return { success: true, commandeId: created.id_commande };
   });
   ```

---

## 📊 Statistiques du projet simplifié

| Élément | Avant | Après |
|---------|-------|-------|
| Fichiers backend | 7 fichiers | **1 fichier** (main.ts) |
| Fichiers frontend HTML | 9 fichiers | **1 fichier** (index.html) |
| Fichiers frontend TS | 10 fichiers | **1 fichier** (renderer.ts) |
| Navigation | Multiples pages | **SPA** (display:none/block) |
| Lisibilité | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## ✅ Fonctionnalités conservées

Toutes les fonctionnalités sont **intactes** :
- ✅ Connexion / Inscription
- ✅ Navigation par rôles (Client, Cuisinier, Livreur, Admin)
- ✅ Voir les restaurants et commander
- ✅ Gérer les commandes (Cuisinier : statuts)
- ✅ Gérer les livraisons (Livreur : accepter, livrer)
- ✅ Administration (attribuer rôles, rattacher cuisiniers)

---

## 🐛 Debugging

### Ouvrir la console développeur
Décommenter dans `main.ts` :
```typescript
win.webContents.openDevTools();
```

### Voir les logs backend
```typescript
console.log('📚 Debug:', variable);
```

### Voir les logs frontend
```typescript
console.log('🔍 Frontend:', data);
```

---

## 🎉 Conclusion

Vous avez maintenant une architecture **extrêmement simple** pour apprendre Electron + Prisma :

1. **Un seul fichier backend** → `src/main/main.ts`
2. **Un seul fichier HTML** → `src/renderer/index.html`
3. **Un seul fichier frontend** → `src/renderer/renderer.ts`
4. **Navigation SPA** → display:none/block

**Bon apprentissage ! 🚀**
