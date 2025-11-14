document.addEventListener('DOMContentLoaded', () => {
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const loginMessage = document.getElementById('login-message');
  const registerMessage = document.getElementById('register-message');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        nom: document.getElementById('register-nom').value,
        prenom: document.getElementById('register-prenom').value,
        email: document.getElementById('register-email').value,
        mot_de_passe: document.getElementById('register-password').value,
      };

      const result = await window.auth.register(data);

      showMessage(registerMessage, result.message, result.success);

      if (result.success) {
        registerForm.reset();
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        email: document.getElementById('login-email').value,
        mot_de_passe: document.getElementById('login-password').value,
      };

      const result = await window.auth.login(data);

      showMessage(loginMessage, result.message, result.success);

      if (result.success) {
        loginForm.style.display = 'none';
      }
    });
  }

  function showMessage(element, message, isSuccess) {
    if (!element) return;
    element.textContent = message;
    element.className = isSuccess ? 'message success' : 'message error';
    element.style.display = 'block';
  }
});
