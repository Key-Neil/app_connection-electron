/**
 * @typedef {Object} User
 * @property {number} id_utilisateur
 * @property {string} prenom
 * @property {string} nom
 * @property {string} email
 * @property {string[]} roles
 */

/**
 * Récupère l'utilisateur actuellement connecté
 * @returns {User|null}
 */
function getCurrentUser() {
    const data = sessionStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
}

/**
 * Enregistre l'utilisateur connecté en session
 * @param {User} user - Utilisateur à enregistrer
 */
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}
/**
 * Efface la session et redirige vers la page de connexion
 */
function clearSession() {
    sessionStorage.removeItem('currentUser');
    try {
        document.querySelectorAll('.modal-backdrop, #global-overlay, .overlay, .backdrop').forEach(el => el.remove());
        document.body.style.pointerEvents = 'auto';
    }
    catch (e) {
        console.debug('clearSession cleanup:', e);
    }
    window.location.href = 'index.html';
}

/**
 * Vérifie que l'utilisateur est connecté, redirige sinon
 * @returns {User}
 */
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
    return user;
}
/**
 * Affiche un message dans un conteneur
 * @param {HTMLElement|null} container - Conteneur du message
 * @param {string} text - Texte du message
 * @param {string} [type='success'] - Type : 'success' ou 'error'
 * @param {number} [timeout=3000] - Délai d'affichage en ms
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
 * @param {string} [type='success'] - Type d'alerte
 */
function showAlert(text, type = 'success') {
    alert(text);
}
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
 * @param {string} [className=''] - Classes CSS
 * @param {string} [innerHTML=''] - Contenu HTML
 * @returns {HTMLElement}
 */
function createElement(tag, className = '', innerHTML = '') {
    const el = document.createElement(tag);
    if (className)
        el.className = className;
    if (innerHTML)
        el.innerHTML = innerHTML;
    return el;
}
async function callApi(apiMethod, ...args) {
    try {
        if (!window.api || !window.api[apiMethod]) {
            throw new Error(`Méthode API ${apiMethod} non trouvée`);
        }
        return await window.api[apiMethod](...args);
    }
    catch (error) {
        console.error(`Appel API échoué: ${apiMethod}`, error);
        throw error;
    }
}
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
