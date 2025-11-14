// src/main/main.js - Processus principal déplacé sous src/main
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Initialise la connexion à la base de données via Prisma
const prisma = new PrismaClient();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Préload est maintenant dans src/preload/preload.js
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Charge la page index depuis src/renderer
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

// --- API SÉCURISÉE (Logique Métier) ---
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
    });

    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);

    if (!isMatch) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    return { success: true, message: `Bienvenue, ${user.prenom} !` };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erreur lors de la connexion.' };
  }
});
