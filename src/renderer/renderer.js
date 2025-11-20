// ============ GESTION DES FORMULAIRES DE CONNEXION / INSCRIPTION ============

document.addEventListener('DOMContentLoaded', () => {
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const loginMessage = document.getElementById('login-message');
  const registerMessage = document.getElementById('register-message');

  // ========== FORMULAIRE D'INSCRIPTION ==========
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Récupérer les données du formulaire
      const data = {
        nom: document.getElementById('register-nom').value,
        prenom: document.getElementById('register-prenom').value,
        email: document.getElementById('register-email').value,
        mot_de_passe: document.getElementById('register-password').value,
      };

      // Appeler l'API d'enregistrement
      const result = await window.auth.register(data);

      // Afficher le message de résultat
      showMessage(registerMessage, result.message, result.success ? 'success' : 'error');

      if (result.success) {
        registerForm.reset();
        // Rediriger vers la page de connexion après 1.2 secondes
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      }
    });
  }

  // ========== FORMULAIRE DE CONNEXION ==========
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Récupérer les données du formulaire
      const data = {
        email: document.getElementById('login-email').value,
        mot_de_passe: document.getElementById('login-password').value,
      };

      // Appeler l'API de connexion
      const result = await window.auth.login(data);

      // Afficher le message de résultat
      showMessage(loginMessage, result.message, result.success ? 'success' : 'error');

      if (result.success) {
        // Enregistrer l'utilisateur en session via utils.js
        if (result.user) {
          setCurrentUser(result.user);
        }
        // Rediriger vers le tableau de bord
        window.location.href = 'tableauDeBord.html';
      }
    });
  }
});
