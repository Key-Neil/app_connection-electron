function getCurrentUser() {
    const data = sessionStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

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

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
    return user;
}

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

function showAlert(text, type = 'success') {
    alert(text);
}

function formatPrice(value) {
    return parseFloat(value).toFixed(2);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

function getElementById(id) {
    return document.getElementById(id);
}

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
