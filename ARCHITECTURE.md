# 🏗️ ARCHITECTURE CONNEXTION APP - STRUCTURE OPTIMISÉE 2025

## 📊 Vue d'ensemble

Une application Electron modulaire et scalable avec:
- **Backend:** Architecture MVC avec contrôleurs par domaine métier
- **Frontend:** Utilitaires centralisés + pages spécialisées
- **Base de données:** Prisma ORM avec schéma optimisé
- **Sections de menu:** Catégories personnalisables par restaurant
- **Sécurité:** Vérification des rôles côté serveur

---

## 🏗️ ARCHITECTURE BACKEND (src/main/)

### main.js [161 LIGNES]
- Point d'entrée Electron
- Enregistrement des handlers IPC (17 handlers)
- Délégation au contrôleurs
- **Ultra lisible et maintenable**

```javascript
// Exemple d'import
const restaurantController = require('./controleurs/restaurantController');

// Exemple de handler
ipcMain.handle('restaurant:addSection', 
  async (event, userId, restaurantId, data) =>
    restaurantController.addSection(userId, restaurantId, data)
);
```

### 📁 Contrôleurs (controleurs/) - 6 fichiers

#### **authController.js** - Authentification
- `register(data)` - Enregistrement
- `login(data)` - Connexion

#### **restaurantController.js** - Restaurants & Menu [REFACTORISÉ]
**Nouvelles fonctions (Sections):**
- `addSection(userId, restaurantId, {nom, description})`
- `updateSection(userId, sectionId, {nom, description})`
- `deleteSection(userId, sectionId)`

**Fonctions produits (mises à jour):**
- `addProduit(userId, sectionId, {nom, prix, description, url_photo})`
  - Accepte maintenant `sectionId` au lieu de `restaurantId`
  - Support des photos d'articles
  
**Fonctions existantes:**
- `getAllRestaurants()` - Retourne sections + produits triés par ordre
- `updateProduit(userId, produitId, data)`
- `deleteProduit(userId, produitId)`

#### **commandeController.js** - Commandes client
- `createCommande(userId, payload)`
- `getCommandes(userId)`

#### **cuisinierController.js** - Cuisine
- `getCommandes(userId)`
- `updateCommandeStatus(userId, commandeId, statut)`

#### **livreurController.js** - Livraisons
- `getDeliveries(userId)`
- `createLivraison(userId, commandeId)`
- `updateLivraisonStatus(userId, livraisonId, statut)`

#### **adminController.js** - Administration
- `getRoles()`
- `getUsers()`
- `setRoles(userId, roleNames)`
- `getProfile(userId)`

### 📁 Utilitaires (utilitaires/) - 2 fichiers

#### **prisma.js**
```javascript
// Singleton pattern - Une seule connexion BD
function getPrismaClient() { ... }
module.exports = { getPrismaClient };
```

#### **auth.js**
```javascript
// Vérification des rôles utilisateur
async function userHasAnyRole(userId, roles) { ... }
module.exports = { userHasAnyRole };
```

---

## 🎨 ARCHITECTURE FRONTEND (src/renderer/)

### Ordre de chargement (dans chaque HTML)
```html
<!-- 1. Utilitaires centralisés -->
<script src="./utils.js" defer></script>

<!-- 2. Navigation globale -->
<script src="./menu.js" defer></script>

<!-- 3. Logique spécifique à la page -->
<script src="./{page}.js" defer></script>
```

### 📄 utils.js [158 LIGNES] - Centralisation totale

**Session Management:**
```javascript
getCurrentUser()      // Récupère l'utilisateur actuellement
setCurrentUser(user)  // Enregistre session
clearSession()        // Efface + redirige vers login
requireAuth()         // Vérifie si authentifié
```

**Notifications:**
```javascript
showMessage(container, text, type='success', timeout=3000)
showAlert(text, type)
```

**Formatage:**
```javascript
formatPrice(value)    // Convertit en euros (2 décimales)
formatDate(dateString) // Formate date locale
```

**DOM Helpers:**
```javascript
getElementById(id)
createElement(tag, className, innerHTML)
```

**API Wrapper:**
```javascript
callApi(apiMethod, ...args) // Wrapper avec gestion erreurs
```

### 📄 menu.js [63 LIGNES] - Navigation [OPTIMISÉ]
```javascript
// Utilise getCurrentUser() au lieu de sessionStorage
const user = getCurrentUser();

// Affiche les liens selon les rôles
// Admin, Client, Cuisinier, Livreur → liens différents
```

### 📄 Fichiers Pages (10 au total)

**Pages authentification:**
- `index.html / renderer.js` - Login/Register
  - Utilise `showMessage()` de utils.js

**Pages client:**
- `restaurants.html / restaurants.js` - Shopping avec sections menu [NEW]
  - Affichage par catégories (Boissons, Desserts, etc.)
  - Support photos produits
  - Gestion sections (add/update/delete)
  - Panier + mini-jeu Snake

**Pages cuisinier:**
- `cuisinier.html / cuisinier.js`
- `commandes-cuisinier.html / commandes-cuisinier.js`

**Pages livreur:**
- `livreur.html / livreur.js`
- `livraisons.html / livraisons.js`

**Pages admin:**
- `admin.html / admin.js`
- `tableauDeBord.html / tableauDeBord.js`

---

## 📊 SCHÉMA BASE DE DONNÉES (Prisma)

### Modèles principaux

**Utilisateur**
```prisma
model Utilisateur {
  id_utilisateur      Int      @id @default(autoincrement())
  nom, prenom         String
  email               String   @unique
  mot_de_passe_hash   String
  roles               Role[]
  restaurants_staff   Restaurant[]
  comptes_commandes   Commande[]
  livraisons          Livraison[]
}
```

**Restaurant**
```prisma
model Restaurant {
  id_restaurant Int    @id @default(autoincrement())
  nom, adresse  String
  telephone     String
  sections      SectionMenu[]  // NEW - Catégories
  produits      Produit[]
  commandes     Commande[]
  staff         Utilisateur[]
}
```

**SectionMenu** [NOUVEAU]
```prisma
model SectionMenu {
  id_section    Int       @id @default(autoincrement())
  nom           String
  description   String?
  ordre         Int       @default(0)  // Ordre d'affichage
  id_restaurant Int
  restaurant    Restaurant @relation(...)
  produits      Produit[]
}
```

**Produit** [AMÉLIORÉ]
```prisma
model Produit {
  id_produit    Int     @id @default(autoincrement())
  nom, prix     String, Float
  description   String?
  url_photo     String?    // NEW - Photos d'articles
  prix_promo    Float?
  id_restaurant Int
  id_section    Int        // NEW - Catégorie
  section       SectionMenu @relation(...)
  restaurant    Restaurant @relation(...)
}
```

---

## 🔐 SÉCURITÉ - Vérification des Rôles

### ✅ CORRECT - Côté serveur
```javascript
// restaurantController.js
async function addSection(userId, restaurantId, data) {
  // Vérification CÔTÉ SERVEUR - PAS DE RISQUE
  if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
    return { success: false, error: 'Accès non autorisé' };
  }
  // ... créer la section
}
```

### ❌ À ÉVITER
- Masquage de boutons en HTML uniquement
- Stockage auth tokens dans localStorage
- Confiance client pour les vérifications de rôles

---

## ✨ AVANTAGES DE CETTE ARCHITECTURE

### 🎯 **Modularité**
- Chaque contrôleur = 1 domaine métier
- Facile à tester individuellement
- Séparation claire Backend ↔ Frontend

### ♻️ **Réutilisabilité**
- `utils.js` : 13 fonctions partagées
- Pas de duplication (showMessage, formatPrice)
- `getCurrentUser()` utilisé partout

### 🔧 **Maintenabilité**
- `main.js` ultra clair (161 lignes)
- Contrôleurs : 1 responsabilité chacun
- `utils.js` : 1 source de vérité

### ⚡ **Performance**
- Prisma singleton (1 connexion BD)
- Scripts lazy-loaded (defer)
- Cache restaurants côté frontend

### 🔒 **Sécurité**
- Vérification rôles côté serveur obligatoire
- Context isolation Electron
- API controlée via preload.js

---

## 📈 STATISTIQUES CODE

| Composant | Lignes | État |
|-----------|--------|------|
| main.js | 161 | ✅ OPTIMISÉ |
| Controllers (6x) | ~800 | ✅ PROPRE |
| Utilities backend | ~150 | ✅ RÉUTILISABLE |
| **TOTAL BACKEND** | **~1100** | **BIEN STRUCTURÉ** |
| utils.js | 158 | ✅ CENTRALISÉ |
| menu.js | 63 | ✅ OPTIMISÉ |
| restaurants.js | 560 | ✅ REFACTORISÉ |
| Pages (9x) | ~2000 | ✅ MODULARISÉ |
| **TOTAL FRONTEND** | **~2800** | **BIEN ORGANISÉ** |

---

## 🚀 POINTS CLÉS POUR LA PRÉSENTATION

1. **Architecture MVC**
   > "Nous avons structuré le backend avec un contrôleur par domaine métier, permettant une séparation claire des responsabilités."

2. **Centralisation Frontend**
   > "Toutes les fonctions communes sont dans utils.js - pas de duplication, une seule source de vérité."

3. **Sécurité Réelle**
   > "La vérification des rôles est faite côté serveur pour chaque action sensible, pas seulement avec du masquage HTML."

4. **Sections de Menu Dynamiques**
   > "Les restaurants peuvent créer autant de catégories qu'ils veulent (Boissons, Desserts, etc.) avec support des photos."

5. **Scalabilité**
   > "La structure permet d'ajouter de nouveaux domaines métier très facilement - créer un nouveau contrôleur et importer dans main.js."

---


     - Affichage des notifications (showMessage)
     - Utilitaires (formatPrice, formatDate)
     - Wrapper API (callApi)

## 📝 Exemple : Ajouter une Nouvelle Fonctionnalité

### Étape 1 : Créer un controller
```javascript
// src/main/controllers/exampleController.js
const { getPrismaClient } = require('../utils/prisma');
const prisma = getPrismaClient();

async function myFunction(userId, data) {
  // Logique ici
  return { success: true, data };
}

module.exports = { myFunction };
```

### Étape 2 : Importer et enregistrer dans main.js
```javascript
const exampleController = require('./controllers/exampleController');

ipcMain.handle('example:myFunction', async (event, userId, data) =>
  exampleController.myFunction(userId, data)
);
```

### Étape 3 : Utiliser côté renderer avec utils.js
```html
<script src="utils.js"></script>
<script>
  const user = getCurrentUser();
  const result = await callApi('exampleFunction', user.id, { /* data */ });
  showMessage(document.getElementById('container'), 'Succès !', 'success');
</script>
```

## 🧹 Nettoyage Effectué

✅ **Supprimé** : `prisma/prisma/` (dossier imbriqué inutile)  
✅ **Créé** : `src/main/controllers/` (5 controllers)  
✅ **Créé** : `src/main/utils/` (prisma.js, auth.js)  
✅ **Créé** : `src/renderer/utils.js` (utilities frontend)  
✅ **Refactorisé** : `src/main/main.js` (de 480 à ~150 lignes)

## 🚀 Démarrage

```bash
npm install
npx prisma db seed
npm start
```

## 📚 Controllers Existants

| Controller | Responsabilités |
|-----------|-----------------|
| **authController.js** | register, login |
| **restaurantController.js** | CRUD restaurants, produits |
| **orderController.js** | Créer commande, lister commandes client |
| **cookController.js** | Lister commandes cuisinier, mettre à jour statut |
| **livreurController.js** | Lister livraisons, créer livraison, mettre à jour statut |
| **adminController.js** | Gérer rôles, utilisateurs, profils |

## 🔒 Sécurité

- Tous les controllers vérifient les autorisations via `userHasAnyRole`
- Les mots de passe sont hashés avec bcryptjs
- Le preload expose une API sécurisée au renderer
- sessionStorage stocke l'utilisateur côté client (sans données sensibles)

## 🔄 Prochaines Étapes Possibles

1. **Tests unitaires** : Tester chaque controller isolément
2. **Logs** : Ajouter un système de logging centralisé
3. **Configuration** : Créer un fichier config.js pour les constantes
4. **Validation** : Ajouter un validator.js pour valider les inputs
5. **Migration vers TypeScript** : Ajouter des types aux controllers
