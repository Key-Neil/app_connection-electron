import { BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { UserService } from '@api/users';
import { RestaurantService } from '@api/restaurants';
import { CommandService } from '@api/commands';
import { DeliveryService } from '@api/deliveries';
import { ProductService } from '@api/products';
import { Logger } from '@utils/logger';

const isDevelopment = isDev || process.env.NODE_ENV === 'development';

export function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = isDevelopment
    ? 'http://localhost:8080'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    // mainWindow = null;
  });

  return mainWindow;
}

// IPC Handlers pour les utilisateurs
ipcMain.handle('user:getAll', async () => {
  try {
    return await UserService.getAllUsers();
  } catch (error) {
    Logger.error('Erreur IPC: getAll users', error);
    throw error;
  }
});

ipcMain.handle('user:getById', async (_, userId: number) => {
  try {
    return await UserService.getUserById(userId);
  } catch (error) {
    Logger.error('Erreur IPC: getById user', error);
    throw error;
  }
});

ipcMain.handle('user:create', async (_, userData) => {
  try {
    return await UserService.createUser(userData);
  } catch (error) {
    Logger.error('Erreur IPC: create user', error);
    throw error;
  }
});

// IPC Handlers pour les restaurants
ipcMain.handle('restaurant:getAll', async () => {
  try {
    return await RestaurantService.getAllRestaurants();
  } catch (error) {
    Logger.error('Erreur IPC: getAll restaurants', error);
    throw error;
  }
});

ipcMain.handle('restaurant:getById', async (_, restaurantId: number) => {
  try {
    return await RestaurantService.getRestaurantById(restaurantId);
  } catch (error) {
    Logger.error('Erreur IPC: getById restaurant', error);
    throw error;
  }
});

// IPC Handlers pour les commandes
ipcMain.handle('command:getAll', async () => {
  try {
    return await CommandService.getAllCommands();
  } catch (error) {
    Logger.error('Erreur IPC: getAll commands', error);
    throw error;
  }
});

ipcMain.handle('command:getById', async (_, commandId: number) => {
  try {
    return await CommandService.getCommandById(commandId);
  } catch (error) {
    Logger.error('Erreur IPC: getById command', error);
    throw error;
  }
});

// IPC Handlers pour les livraisons
ipcMain.handle('delivery:getAll', async () => {
  try {
    return await DeliveryService.getAllDeliveries();
  } catch (error) {
    Logger.error('Erreur IPC: getAll deliveries', error);
    throw error;
  }
});

ipcMain.handle('delivery:getAvailable', async () => {
  try {
    return await DeliveryService.getAvailableDeliveries();
  } catch (error) {
    Logger.error('Erreur IPC: getAvailable deliveries', error);
    throw error;
  }
});

// IPC Handlers pour les produits
ipcMain.handle('product:getAll', async () => {
  try {
    return await ProductService.getAllProducts();
  } catch (error) {
    Logger.error('Erreur IPC: getAll products', error);
    throw error;
  }
});

ipcMain.handle('product:getByRestaurant', async (_, restaurantId: number) => {
  try {
    return await ProductService.getProductsByRestaurant(restaurantId);
  } catch (error) {
    Logger.error('Erreur IPC: getByRestaurant products', error);
    throw error;
  }
});
