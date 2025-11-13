import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // User APIs
  getUsersAll: () => ipcRenderer.invoke('user:getAll'),
  getUserById: (id: number) => ipcRenderer.invoke('user:getById', id),
  createUser: (userData: unknown) => ipcRenderer.invoke('user:create', userData),

  // Restaurant APIs
  getRestaurantsAll: () => ipcRenderer.invoke('restaurant:getAll'),
  getRestaurantById: (id: number) => ipcRenderer.invoke('restaurant:getById', id),

  // Command APIs
  getCommandsAll: () => ipcRenderer.invoke('command:getAll'),
  getCommandById: (id: number) => ipcRenderer.invoke('command:getById', id),

  // Delivery APIs
  getDeliveriesAll: () => ipcRenderer.invoke('delivery:getAll'),
  getDeliveriesAvailable: () => ipcRenderer.invoke('delivery:getAvailable'),

  // Product APIs
  getProductsAll: () => ipcRenderer.invoke('product:getAll'),
  getProductsByRestaurant: (restaurantId: number) =>
    ipcRenderer.invoke('product:getByRestaurant', restaurantId),
});
