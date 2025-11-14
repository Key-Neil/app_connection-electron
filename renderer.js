document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('login-view');
  const registerView = document.getElementById('register-view');

  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const loginMessage = document.getElementById('login-message');
  const registerMessage = document.getElementById('register-message');

  showRegisterLink.addEventListener('click', () => {
    loginView.style.display = 'none';
    registerView.style.display = 'block';
  });

  showLoginLink.addEventListener('click', () => {
    registerView.style.display = 'none';
    loginView.style.display = 'block';
  });

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
        showLoginLink.click();
        loginMessage.innerText = 'Compte créé ! Veuillez vous connecter.';
        loginMessage.className = 'message success';
        loginMessage.style.display = 'block';
      }, 2000);
    }
  });

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

  function showMessage(element, message, isSuccess) {
    element.textContent = message;
    element.className = isSuccess ? 'message success' : 'message error';
    element.style.display = 'block';
  }
});