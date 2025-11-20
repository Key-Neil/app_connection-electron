/**
 * UTILITAIRES FRONTEND CENTRALISÉS
 * Fonctions réutilisables dans tous les fichiers renderer
 */

// ============ GESTION DE SESSION & STOCKAGE ============

/**
 * Récupère l'utilisateur actuellement connecté
 * @returns {Object|null}
 */
function getCurrentUser() {
  const data = sessionStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
}

/**
 * Enregistre l'utilisateur connecté en session
 * @param {Object} user - Utilisateur à enregistrer
 */
function setCurrentUser(user) {
  sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Efface la session et redirige vers la page de connexion
 */
function clearSession() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

/**
 * Vérifie que l'utilisateur est connecté, redirige sinon
 * @returns {Object}
 */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
  }
  return user;
}

// ============ NOTIFICATIONS & MESSAGES ============

/**
 * Affiche un message dans un conteneur
 * @param {HTMLElement} container - Conteneur du message
 * @param {string} text - Texte du message
 * @param {string} type - Type : 'success' ou 'error'
 * @param {number} timeout - Délai d'affichage en ms (0 = permanent)
 * @returns {HTMLElement}
 */
function showMessage(container, text, type = 'success', timeout = 3000) {
  const msg = document.createElement('div');
  msg.className = `message-inline ${type === 'success' ? 'success' : 'error'}`;
  msg.textContent = text;
  if (container) {
    container.prepend(msg);
  }
  if (timeout > 0) {
    setTimeout(() => msg.remove(), timeout);
  }
  return msg;
}

/**
 * Affiche une alerte standard
 * @param {string} text - Texte de l'alerte
 * @param {string} type - Type d'alerte (non utilisé actuellement)
 */
function showAlert(text, type = 'success') {
  alert(text);
}

// ============ UTILITAIRES DE FORMATAGE ============

/**
 * Formate un prix en euros
 * @param {number} value - Prix à formater
 * @returns {string}
 */
function formatPrice(value) {
  return parseFloat(value).toFixed(2);
}

/**
 * Formate une date au format locale
 * @param {string} dateString - Chaîne de date
 * @returns {string}
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

// ============ AIDES DOM ============

/**
 * Récupère un élément par ID
 * @param {string} id - ID de l'élément
 * @returns {HTMLElement|null}
 */
function getElementById(id) {
  return document.getElementById(id);
}

/**
 * Crée un nouvel élément HTML
 * @param {string} tag - Tag HTML
 * @param {string} className - Classes CSS
 * @param {string} innerHTML - Contenu HTML
 * @returns {HTMLElement}
 */
function createElement(tag, className = '', innerHTML = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

// ============ WRAPPER API AVEC GESTION ERREURS ============

/**
 * Appelle une méthode de l'API via window.api
 * @param {string} apiMethod - Nom de la méthode API
 * @param {...*} args - Arguments de la méthode
 * @returns {Promise<*>}
 */
async function callApi(apiMethod, ...args) {
  try {
    if (!window.api || !window.api[apiMethod]) {
      throw new Error(`Méthode API ${apiMethod} non trouvée`);
    }
    return await window.api[apiMethod](...args);
  } catch (error) {
    console.error(`Appel API échoué: ${apiMethod}`, error);
    throw error;
  }
}

// ============ EXPORT ============
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCurrentUser,
    setCurrentUser,
    clearSession,
    requireAuth,
    showMessage,
    showAlert,
    formatPrice,
    formatDate,
    getElementById,
    createElement,
    callApi,
  };
}
