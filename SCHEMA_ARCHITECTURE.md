# 🎓 Schéma de l'Architecture Simplifiée

## 📊 Vue d'ensemble du flux de données

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROCESSUS RENDERER (Frontend)                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  index.html (SPA avec display:none/block)                │   │
│  │  ┌─────────────┬─────────────┬──────────┬──────────┐    │   │
│  │  │ view-login  │ view-       │ view-    │ view-    │    │   │
│  │  │             │ restaurants │ cook     │ admin    │    │   │
│  │  └─────────────┴─────────────┴──────────┴──────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  renderer.ts (TOUTE la logique frontend)                 │   │
│  │  • État global (currentUser, cart)                       │   │
│  │  • Fonctions de navigation (showView, showNavBar)        │   │
│  │  • Gestionnaires d'événements (handleLogin, etc.)        │   │
│  │  • Chargement des données (loadRestaurants, etc.)        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│                    Appelle window.auth / window.api               │
└───────────────────────────┼───────────────────────────────────────┘
                            ↓
┌───────────────────────────┼───────────────────────────────────────┐
│                    PROCESSUS PRELOAD (Pont)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  preload.ts                                              │   │
│  │                                                          │   │
│  │  contextBridge.exposeInMainWorld('auth', {...})         │   │
│  │  contextBridge.exposeInMainWorld('api', {...})          │   │
│  │                                                          │   │
│  │  • register → ipcRenderer.invoke('auth:register')       │   │
│  │  • login → ipcRenderer.invoke('auth:login')             │   │
│  │  • getAllRestaurants → ipcRenderer.invoke(...)          │   │
│  │  • createCommande → ipcRenderer.invoke(...)             │   │
│  │  • ... (toutes les autres fonctions)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
│                      Envoie via IPC                               │
└───────────────────────────┼───────────────────────────────────────┘
                            ↓
┌───────────────────────────┼───────────────────────────────────────┐
│                     PROCESSUS MAIN (Backend)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  main.ts (TOUTE la logique backend)                      │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ IPC HANDLERS                                    │    │   │
│  │  │                                                 │    │   │
│  │  │ ipcMain.handle('auth:register', async () => {  │    │   │
│  │  │   // Logique d'inscription avec Prisma        │    │   │
│  │  │   const user = await prisma.utilisateur.create│    │   │
│  │  │ })                                             │    │   │
│  │  │                                                │    │   │
│  │  │ ipcMain.handle('restaurant:getAll', async ()  │    │   │
│  │  │ ipcMain.handle('commande:create', async ()    │    │   │
│  │  │ ipcMain.handle('livraison:updateStatus', ...)  │    │   │
│  │  │ ... (tous les handlers au même endroit)       │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                         ↓                                │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ PRISMA (ORM)                                   │    │   │
│  │  │                                                │    │   │
│  │  │ prisma.utilisateur.create(...)                │    │   │
│  │  │ prisma.commande.findMany(...)                 │    │   │
│  │  │ prisma.restaurant.update(...)                  │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                      │
└───────────────────────────┼───────────────────────────────────────┘
                            ↓
                   ┌────────────────────┐
                   │  MySQL Database    │
                   │  • utilisateurs    │
                   │  • restaurants     │
                   │  • commandes       │
                   │  • livraisons      │
                   └────────────────────┘
```

---

## 🔄 Exemple de flux complet : Passer une commande

### 1. **Action utilisateur** (Frontend)
```typescript
// renderer.ts - L'utilisateur clique sur "Commander"
async function validateCart() {
  const payload = {
    id_restaurant: selectedRestaurantId,
    produits: cart.map(item => ({ id: item.id, quantite: item.quantite }))
  };
  
  // Appel à l'API exposée
  const result = await window.api.createCommande(currentUser.id, payload);
  
  if (result.success) {
    alert('Commande passée !');
  }
}
```

### 2. **Transmission sécurisée** (Preload)
```typescript
// preload.ts - Exposition sécurisée de l'API
contextBridge.exposeInMainWorld('api', {
  createCommande: (userId: number, payload: any) => 
    ipcRenderer.invoke('commande:create', userId, payload),
});
```

### 3. **Traitement backend** (Main)
```typescript
// main.ts - Handler IPC + Prisma
ipcMain.handle('commande:create', async (event, userId, payload) => {
  try {
    const { id_restaurant, produits } = payload;
    
    // Préparer les détails de commande
    const details = [];
    for (const p of produits) {
      const prod = await prisma.produit.findUnique({
        where: { id_produit: Number(p.id) }
      });
      details.push({
        id_produit: Number(p.id),
        quantite: Number(p.quantite),
        prix_unitaire: prod ? prod.prix : 0
      });
    }
    
    // Créer la commande en base
    const created = await prisma.commande.create({
      data: {
        statut: 'En attente',
        id_client: Number(userId),
        id_restaurant: Number(id_restaurant),
        details_commande: { create: details }
      }
    });
    
    return { success: true, commandeId: created.id_commande };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
```

### 4. **Sauvegarde en base** (Prisma → MySQL)
```sql
-- MySQL reçoit les requêtes SQL générées par Prisma
INSERT INTO Commande (statut, id_client, id_restaurant, date_commande) 
VALUES ('En attente', 1, 2, NOW());

INSERT INTO DetailsCommande (id_commande, id_produit, quantite, prix_unitaire)
VALUES (42, 5, 2, 12.50);
```

### 5. **Retour au frontend** (Main → Preload → Renderer)
```typescript
// La promesse se résout dans renderer.ts
const result = await window.api.createCommande(...);
// result = { success: true, commandeId: 42 }

if (result.success) {
  alert('Commande #' + result.commandeId + ' créée !');
  cart = []; // Vider le panier
  updateCartDisplay();
}
```

---

## 🎯 Points clés de l'architecture simplifiée

### ✅ Avantages

1. **Lisibilité maximale**
   - Tout le backend dans `main.ts` → lecture linéaire
   - Tout le frontend dans `renderer.ts` → flux clair

2. **Apprentissage facilité**
   - Pas besoin de naviguer entre 20 fichiers
   - Commentaires pédagogiques en français
   - Structure cohérente

3. **Maintenance simple**
   - Ajouter une fonctionnalité = modifier 3-4 fichiers max
   - Pas de confusion sur "où mettre le code"

4. **Respect des contraintes**
   - ✅ Séparation Main/Preload/Renderer
   - ✅ Electron + Prisma
   - ✅ TypeScript
   - ✅ Toutes les fonctionnalités conservées

### 📏 Règles de l'architecture

1. **Main (`main.ts`)**
   - Contient TOUS les IPC handlers
   - Appelle directement Prisma
   - Pas d'import de contrôleurs externes

2. **Preload (`preload.ts`)**
   - Expose window.auth et window.api
   - Chaque fonction = un `ipcRenderer.invoke()`

3. **Renderer (`renderer.ts`)**
   - Gère l'état global (currentUser, cart)
   - Navigation SPA avec `showView()`
   - Appelle window.api pour communiquer avec le backend

4. **HTML (`index.html`)**
   - Toutes les vues dans le même fichier
   - Basculement avec `display: none/block`
   - Un seul `<script src="renderer.js"></script>`

---

## 🚀 Comment ajouter une nouvelle fonctionnalité

### Exemple : Ajouter un système d'avis sur les restaurants

#### 1️⃣ Backend (`main.ts`)
```typescript
// ============================================================
// AVIS - Gestion des avis clients
// ============================================================

// Créer un avis
ipcMain.handle('avis:create', async (event, userId, restaurantId, note, commentaire) => {
  try {
    const avis = await prisma.avis.create({
      data: {
        id_client: Number(userId),
        id_restaurant: Number(restaurantId),
        note: Number(note),
        commentaire
      }
    });
    return { success: true, avisId: avis.id_avis };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Récupérer les avis d'un restaurant
ipcMain.handle('avis:getForRestaurant', async (event, restaurantId) => {
  try {
    const avis = await prisma.avis.findMany({
      where: { id_restaurant: Number(restaurantId) },
      include: { client: true }
    });
    return avis;
  } catch (err) {
    return [];
  }
});
```

#### 2️⃣ Preload (`preload.ts`)
```typescript
contextBridge.exposeInMainWorld('api', {
  // ... autres fonctions
  
  // Avis
  createAvis: (userId: number, restaurantId: number, note: number, commentaire: string) =>
    ipcRenderer.invoke('avis:create', userId, restaurantId, note, commentaire),
  
  getAvisForRestaurant: (restaurantId: number) =>
    ipcRenderer.invoke('avis:getForRestaurant', restaurantId),
});
```

#### 3️⃣ Types (`global.d.ts`)
```typescript
export interface Window {
  api: {
    // ... autres fonctions
    
    createAvis: (userId: number, restaurantId: number, note: number, commentaire: string) => 
      Promise<{ success: boolean; avisId?: number; error?: string }>;
    getAvisForRestaurant: (restaurantId: number) => Promise<any[]>;
  };
}
```

#### 4️⃣ Frontend (`renderer.ts`)
```typescript
// Charger les avis d'un restaurant
async function loadAvisForRestaurant(restaurantId: number) {
  const avis = await (window as any).api.getAvisForRestaurant(restaurantId);
  
  const avisDiv = document.getElementById('restaurant-avis');
  if (!avisDiv) return;
  
  avisDiv.innerHTML = avis.map((a: any) => `
    <div style="border:1px solid #ddd; padding:0.5rem; margin:0.5rem 0;">
      <strong>${a.client?.prenom || 'Anonyme'}</strong> - ⭐ ${a.note}/5
      <p>${a.commentaire}</p>
    </div>
  `).join('');
}

// Soumettre un avis
async function handleSubmitAvis() {
  const note = Number((document.getElementById('avis-note') as HTMLInputElement).value);
  const commentaire = (document.getElementById('avis-commentaire') as HTMLTextAreaElement).value;
  
  const result = await (window as any).api.createAvis(
    currentUser.id, 
    selectedRestaurantId, 
    note, 
    commentaire
  );
  
  if (result.success) {
    alert('Avis publié !');
    loadAvisForRestaurant(selectedRestaurantId);
  }
}
```

#### 5️⃣ HTML (`index.html`)
```html
<!-- Ajouter dans view-restaurants -->
<div id="restaurant-avis">
  <!-- Les avis s'afficheront ici -->
</div>

<h4>Laisser un avis</h4>
<input type="number" id="avis-note" min="1" max="5" placeholder="Note /5">
<textarea id="avis-commentaire" placeholder="Votre commentaire"></textarea>
<button id="submit-avis" class="btn">Publier</button>

<script>
  // Dans DOMContentLoaded
  document.getElementById('submit-avis')?.addEventListener('click', handleSubmitAvis);
</script>
```

---

## 📚 Ressources pour aller plus loin

### Documentation officielle
- **Electron** : https://www.electronjs.org/docs
- **Prisma** : https://www.prisma.io/docs
- **TypeScript** : https://www.typescriptlang.org/docs

### Concepts clés à maîtriser
1. **IPC (Inter-Process Communication)** : Communication entre processus Electron
2. **Context Isolation** : Sécurité entre Renderer et Main
3. **Prisma Schema** : Modélisation de base de données
4. **Async/Await** : Gestion de l'asynchrone en JavaScript

---

## 🎉 Félicitations !

Vous avez maintenant une compréhension complète de l'architecture simplifiée. Cette structure est idéale pour :
- ✅ Apprendre les bases d'Electron et Prisma
- ✅ Prototyper rapidement des fonctionnalités
- ✅ Comprendre le flux de données d'une application desktop

**Pour un projet de production**, vous voudrez probablement revenir à une architecture modulaire avec des contrôleurs séparés, mais pour l'apprentissage, cette version compacte est parfaite ! 🚀
