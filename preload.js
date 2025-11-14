const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
  /**
   * Envoie une demande d'inscription au processus principal
   * @param {object} data - { nom, prenom, email, mot_de_passe }
   * @returns {Promise<object>} - { success: boolean, message: string }
   */
  register: (data) => ipcRenderer.invoke('auth:register', data),

  /**
   * Envoie une demande de connexion au processus principal
   * @param {object} data - { email, mot_de_passe }
   * @returns {Promise<object>} - { success: boolean, message: string }
   */
  login: (data) => ipcRenderer.invoke('auth:login', data),
});