import { setCurrentUser, resetCart } from './state.js';
import { showView, showNavBar, hideNavBar } from './navigation.js';
import { forceInputInteractivity } from './utils.js';
import { loadRestaurants } from './restaurants.js';

function checkAuthBridge(): boolean {
  return !!(window as any).auth;
}

function resetLoginForm() {
  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;
  const errorDiv = document.getElementById('login-error');
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (errorDiv) errorDiv.textContent = '';
}

function resetRegisterForm() {
  const nomInput = document.getElementById('register-nom') as HTMLInputElement;
  const prenomInput = document.getElementById('register-prenom') as HTMLInputElement;
  const telInput = document.getElementById('register-tel') as HTMLInputElement;
  const adresseInput = document.getElementById('register-adresse') as HTMLInputElement;
  const emailInput = document.getElementById('register-email') as HTMLInputElement;
  const passwordInput = document.getElementById('register-password') as HTMLInputElement;
  const errorDiv = document.getElementById('register-error');
  if (nomInput) nomInput.value = '';
  if (prenomInput) prenomInput.value = '';
  if (telInput) telInput.value = '';
  if (adresseInput) adresseInput.value = '';
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (errorDiv) errorDiv.textContent = '';
}

export async function handleLogin(event: Event) {
  event.preventDefault();
  forceInputInteractivity();

  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;
  const errorDiv = document.getElementById('login-error');

  if (!emailInput || !passwordInput || !errorDiv) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    errorDiv.textContent = 'Veuillez remplir tous les champs.';
    return;
  }

  try {
    if (!checkAuthBridge()) {
      errorDiv.textContent = 'Erreur interne: bridge d\'authentification indisponible.';
      return;
    }
    const resp = await (window as any).auth.login({ email, mot_de_passe: password });
    if (!resp || !resp.success || !resp.user) {
      errorDiv.textContent = (resp && resp.message) || 'Email ou mot de passe incorrect.';
      return;
    }
    setCurrentUser(resp.user);
    resetCart();
    showNavBar();
    showView('view-restaurants');
    await loadRestaurants();
    resetLoginForm();
  } catch (err: any) {
    errorDiv.textContent = err?.message || 'Erreur de connexion';
  }
}

export async function handleRegister(event: Event) {
  event.preventDefault();
  forceInputInteractivity();

  const nomInput = document.getElementById('register-nom') as HTMLInputElement;
  const prenomInput = document.getElementById('register-prenom') as HTMLInputElement;
  const telInput = document.getElementById('register-tel') as HTMLInputElement;
  const adresseInput = document.getElementById('register-adresse') as HTMLInputElement;
  const emailInput = document.getElementById('register-email') as HTMLInputElement;
  const passwordInput = document.getElementById('register-password') as HTMLInputElement;
  const errorDiv = document.getElementById('register-error');

  if (!nomInput || !prenomInput || !telInput || !adresseInput || !emailInput || !passwordInput || !errorDiv) return;

  const nom = nomInput.value.trim();
  const prenom = prenomInput.value.trim();
  const tel = telInput.value.trim();
  const adresse = adresseInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!nom || !prenom || !tel || !adresse || !email || !password) {
    errorDiv.textContent = 'Veuillez remplir tous les champs.';
    return;
  }

  try {
    if (!checkAuthBridge()) {
      errorDiv.textContent = 'Erreur interne: bridge d\'authentification indisponible.';
      return;
    }
    const registerResp = await (window as any).auth.register({
      nom,
      prenom,
      email,
      mot_de_passe: password
    });
    if (!registerResp || !registerResp.success) {
      errorDiv.textContent = (registerResp && registerResp.message) || 'Erreur lors de la création du compte.';
      return;
    }
    const loginResp = await (window as any).auth.login({ email, mot_de_passe: password });
    if (!loginResp || !loginResp.success || !loginResp.user) {
      errorDiv.textContent = (loginResp && loginResp.message) || 'Connexion automatique après inscription échouée.';
      return;
    }

    setCurrentUser(loginResp.user);
    resetCart();
    showNavBar();
    showView('view-restaurants');
    await loadRestaurants();
    resetRegisterForm();
  } catch (err: any) {
    errorDiv.textContent = err?.message || 'Erreur d\'inscription';
  }
}

export function toggleLoginRegister() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (!loginForm || !registerForm) return;

  if (loginForm.style.display !== 'none') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  } else {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  }
}

export function handleLogout() {
  setCurrentUser(null);
  resetCart();
  hideNavBar();
  showView('view-login');
}

export function initAuthModule() {
  const loginFormEl = document.getElementById('login-form-el');
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', handleLogin);
  }

  const registerFormEl = document.getElementById('register-form-el');
  if (registerFormEl) {
    registerFormEl.addEventListener('submit', handleRegister);
  }

  const toRegisterBtn = document.getElementById('to-register-btn');
  if (toRegisterBtn) {
    toRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLoginRegister();
    });
  }

  const toLoginBtn = document.getElementById('to-login-btn');
  if (toLoginBtn) {
    toLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLoginRegister();
    });
  }

  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}
