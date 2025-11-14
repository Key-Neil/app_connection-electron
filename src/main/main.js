
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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

ipcMain.handle('auth:register', async (event, data) => {
  const { nom, prenom, email, mot_de_passe } = data;

  try {
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }

    const salt = await bcrypt.genSalt(10);
    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, salt);

    const newUser = await prisma.utilisateur.create({
      data: {
        nom: nom,
        prenom: prenom,
        email: email,
        mot_de_passe_hash: mot_de_passe_hash,
      },
    });

    await prisma.utilisateur.update({
      where: { id_utilisateur: newUser.id_utilisateur },
      data: {
        roles: {
          connect: { id_role: 1 },
        },
      },
    });

    return { success: true, message: 'Compte créé avec succès !' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erreur lors de la création du compte.' };
  }
});

ipcMain.handle('auth:login', async (event, data) => {
  const { email, mot_de_passe } = data;

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email: email },
      include: { roles: true },
    });

    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);

    if (!isMatch) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    // Préparer un objet user sûr à renvoyer au renderer (sans mot_de_passe_hash)
    const safeUser = {
      id: user.id_utilisateur,
      prenom: user.prenom,
      email: user.email,
      roles: (user.roles || []).map(r => r.nom_role),
    };

    return { success: true, message: `Bienvenue, ${user.prenom} !`, user: safeUser };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erreur lors de la connexion.' };
  }
});

// Récupère le profil utilisateur minimal
ipcMain.handle('user:getProfile', async (event, userId) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { roles: true },
      select: {
        id_utilisateur: true,
        prenom: true,
        email: true,
        roles: true,
      }
    });
    if (!user) return null;
    return {
      id: user.id_utilisateur,
      prenom: user.prenom,
      email: user.email,
      roles: (user.roles || []).map(r => r.nom_role),
    };
  } catch (err) {
    console.error(err);
    return null;
  }
});

// Récupère les commandes du client
ipcMain.handle('user:getCommandes', async (event, userId) => {
  try {
    const commandes = await prisma.commande.findMany({
      where: { id_client: Number(userId) },
      include: {
        restaurant: true,
        details_commande: { include: { produit: true } },
        livraison: true,
      },
      orderBy: { date_commande: 'desc' }
    });

    // Mapper pour renvoyer une structure simple
    return commandes.map(c => ({
      id: c.id_commande,
      date: c.date_commande,
      statut: c.statut,
      restaurant: c.restaurant ? { id: c.restaurant.id_restaurant, nom: c.restaurant.nom } : null,
      details: (c.details_commande || []).map(d => ({ produit: d.produit ? { id: d.produit.id_produit, nom: d.produit.nom } : null, quantite: d.quantite, prix_unitaire: d.prix_unitaire })),
      livraison: c.livraison ? { id: c.livraison.id_livraison, statut: c.livraison.statut_livraison } : null,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

// --- Admin endpoints ---
ipcMain.handle('admin:getRoles', async () => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { id_role: 'asc' } });
    return roles.map(r => ({ id: r.id_role, nom: r.nom_role }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle('admin:getUsers', async () => {
  try {
    const users = await prisma.utilisateur.findMany({ include: { roles: true } });
    return users.map(u => ({ id: u.id_utilisateur, nom: u.nom, prenom: u.prenom, email: u.email, roles: (u.roles||[]).map(r=>r.nom_role)}));
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle('admin:setRoles', async (event, userId, roleNames) => {
  try {
    // roleNames : array of role name strings to assign
    const roles = await prisma.role.findMany({ where: { nom_role: { in: roleNames } } });
    const roleConnect = roles.map(r => ({ id_role: r.id_role }));

    await prisma.utilisateur.update({
      where: { id_utilisateur: Number(userId) },
      data: {
        roles: {
          set: [],
          connect: roleConnect,
        }
      }
    });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// --- Cuisinier (cook) endpoints ---
ipcMain.handle('cook:getRestaurants', async (event, userId) => {
  try {
    // return restaurants where the user is staff
    const restos = await prisma.restaurant.findMany({
      where: { staff: { some: { id_utilisateur: Number(userId) } } }
    });
    return restos.map(r => ({ id: r.id_restaurant, nom: r.nom, adresse: r.adresse, telephone: r.telephone }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle('cook:updateRestaurant', async (event, restaurantId, data) => {
  try {
    const updated = await prisma.restaurant.update({ where: { id_restaurant: Number(restaurantId) }, data });
    return { success: true, restaurant: { id: updated.id_restaurant, nom: updated.nom } };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// --- Livreur endpoints ---
ipcMain.handle('livreur:getDeliveries', async (event, userId) => {
  try {
    const livraisons = await prisma.livraison.findMany({ where: { id_livreur: Number(userId) }, include: { commande: true } });
    return livraisons.map(l => ({ id: l.id_livraison, statut: l.statut_livraison, commandeId: l.id_commande }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle('livreur:updateLivraisonStatus', async (event, livraisonId, statut) => {
  try {
    const updated = await prisma.livraison.update({ where: { id_livraison: Number(livraisonId) }, data: { statut_livraison: statut } });
    return { success: true, livraison: { id: updated.id_livraison, statut: updated.statut_livraison } };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});
