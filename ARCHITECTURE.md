# Architecture Refactorisée - Connextion App Electron

## 📁 Nouvelle Structure de Projet

```
src/
├── main/
│   ├── controllers/
│   │   ├── authController.js         # Authentification (register, login)
│   │   ├── restaurantController.js   # Gestion des restaurants et produits
│   │   ├── orderController.js        # Gestion des commandes client
│   │   ├── cookController.js         # Logique cuisinier
│   │   ├── livreurController.js      # Logique livreur
│   │   └── adminController.js        # Gestion admin (rôles, utilisateurs)
│   ├── utils/
│   │   ├── prisma.js                 # Configuration Prisma centralisée
│   │   └── auth.js                   # Utilitaires authentification
│   └── main.js                       # Point d'entrée Electron (allégé)
├── preload/
│   └── preload.js                    # Pont sécurisé Electron → Renderer
└── renderer/
    ├── utils.js                      # Utilitaires frontend (sessionStorage, messages, etc.)
    ├── *.html / *.js                 # Pages et scripts (login, restaurants, admin, cook, etc.)
    └── index.css                     # Styles centralisés
prisma/
├── schema.prisma                     # Schéma Prisma (inchangé)
├── seed.js                           # Seeding (inchangé)
└── migrations/                       # Migrations (inchangé)
```

## 🎯 Avantages de cette Architecture

### 1. **Séparation des Responsabilités**
   - **controllers/** : Logique métier isolée par domaine
   - **utils/** : Fonctions réutilisables (Prisma, auth, etc.)
   - **renderer/utils.js** : Utilities frontend centralisées

### 2. **main.js Allégé**
   - Avant : ~480 lignes (tout mélangé)
   - Après : ~150 lignes (IPC handlers uniquement)
   - Les importations de controllers rendent le code lisible

### 3. **Maintenabilité**
   - Ajouter une nouvelle fonctionnalité = créer un nouveau controller
   - Modifier la logique = éditer le controller correspondant
   - Tester = isoler un controller sans toucher à main.js

### 4. **Réutilisabilité Frontend**
   - `src/renderer/utils.js` centralise :
     - Gestion `sessionStorage` (getCurrentUser, setCurrentUser)
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
