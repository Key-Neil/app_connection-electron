const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// ============ IMPORTATION DES CONTROLLERS ============
const authController = require('./controleurs/authController');
const restaurantController = require('./controleurs/restaurantController');
const commandeController = require('./controleurs/commandeController');
const cuisinierController = require('./controleurs/cuisinierController');
const livreurController = require('./controleurs/livreurController');
const adminController = require('./controleurs/adminController');
const { getPrismaClient } = require('./utilitaires/prisma');

// ============ GESTION DES FENÊTRES ELECTRON ============
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============ HANDLERS IPC : AUTHENTIFICATION ============
ipcMain.handle('auth:register', async (event, data) =>
  authController.register(data)
);

ipcMain.handle('auth:login', async (event, data) =>
  authController.login(data)
);

// ============ HANDLERS IPC : RESTAURANTS ============
ipcMain.handle('restaurant:getAll', async () =>
  restaurantController.getAllRestaurants()
);

ipcMain.handle('restaurant:add', async (event, userId, data) =>
  restaurantController.addRestaurant(userId, data)
);

ipcMain.handle('restaurant:delete', async (event, userId, id) =>
  restaurantController.deleteRestaurant(userId, id)
);

ipcMain.handle('restaurant:addProduit', async (event, userId, restaurantId, produit) =>
  restaurantController.addProduit(userId, restaurantId, produit)
);

ipcMain.handle('restaurant:updateProduit', async (event, userId, produitId, data) =>
  restaurantController.updateProduit(userId, produitId, data)
);

ipcMain.handle('restaurant:deleteProduit', async (event, userId, produitId) =>
  restaurantController.deleteProduit(userId, produitId)
);

ipcMain.handle('restaurant:addSection', async (event, userId, restaurantId, data) =>
  restaurantController.addSection(userId, restaurantId, data)
);

ipcMain.handle('restaurant:updateSection', async (event, userId, sectionId, data) =>
  restaurantController.updateSection(userId, sectionId, data)
);

ipcMain.handle('restaurant:deleteSection', async (event, userId, sectionId) =>
  restaurantController.deleteSection(userId, sectionId)
);

// ============ HANDLERS IPC : COMMANDES ============
ipcMain.handle('commande:create', async (event, userId, payload) =>
  commandeController.createCommande(userId, payload)
);

ipcMain.handle('user:getCommandes', async (event, userId) =>
  commandeController.getCommandes(userId)
);

// ============ HANDLERS IPC : CUISINIER ============
ipcMain.handle('cook:getCommandes', async (event, userId) =>
  cuisinierController.getCommandes(userId)
);

ipcMain.handle('cook:updateCommandeStatus', async (event, userId, commandeId, statut) =>
  cuisinierController.updateCommandeStatus(userId, commandeId, statut)
);

ipcMain.handle('cook:getRestaurants', async (event, userId) => {
  const prisma = getPrismaClient();
  try {
    console.log('📚 [cook:getRestaurants] Recherche restaurants pour userId:', userId);
    const restos = await prisma.restaurant.findMany({
      where: { staff: { some: { id_utilisateur: Number(userId) } } },
    });
    console.log('📚 [cook:getRestaurants] Restaurants trouvés:', restos.length, restos);
    return restos.map(r => ({
      id: r.id_restaurant,
      nom: r.nom,
      adresse: r.adresse,
      telephone: r.telephone,
    }));
  } catch (err) {
    console.error('❌ [cook:getRestaurants] Erreur:', err);
    return [];
  }
});

ipcMain.handle('cook:updateRestaurant', async (event, restaurantId, data) => {
  const prisma = getPrismaClient();
  try {
    const updated = await prisma.restaurant.update({
      where: { id_restaurant: Number(restaurantId) },
      data,
    });
    return { success: true, restaurant: { id: updated.id_restaurant, nom: updated.nom } };
  } catch (err) {
    console.error('Erreur lors de la mise à jour du restaurant:', err);
    return { success: false, error: err.message };
  }
});

// ============ HANDLERS IPC : LIVREUR ============
ipcMain.handle('livreur:getDeliveries', async (event, userId) =>
  livreurController.getDeliveries(userId)
);

ipcMain.handle('livreur:getAvailableCommandes', async () =>
  livreurController.getAvailableCommandes()
);

ipcMain.handle('livreur:createLivraison', async (event, userId, commandeId) =>
  livreurController.createLivraison(userId, commandeId)
);

ipcMain.handle('livreur:updateLivraisonStatus', async (event, userId, livraisonId, statut) =>
  livreurController.updateLivraisonStatus(userId, livraisonId, statut)
);

// ============ HANDLERS IPC : ADMINISTRATION ============
ipcMain.handle('admin:getRoles', async () =>
  adminController.getRoles()
);

ipcMain.handle('admin:getUsers', async () =>
  adminController.getUsers()
);

ipcMain.handle('admin:setRoles', async (event, userId, roleNames) =>
  adminController.setRoles(userId, roleNames)
);

ipcMain.handle('user:getProfile', async (event, userId) =>
  adminController.getProfile(userId)
);
