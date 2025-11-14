const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
  register: (data) => ipcRenderer.invoke('auth:register', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
});

contextBridge.exposeInMainWorld('api', {
  getProfile: (userId) => ipcRenderer.invoke('user:getProfile', userId),
  getCommandes: (userId) => ipcRenderer.invoke('user:getCommandes', userId),
});
