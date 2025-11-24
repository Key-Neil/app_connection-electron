document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            const emailInput = document.getElementById('login-email');
            if (emailInput) {
                emailInput.focus();
                try {
                    emailInput.click();
                }
                catch (e) { }
            }
            document.body.style.pointerEvents = 'auto';
        }
        catch (e) {
            console.debug('focus-fix:', e);
        }
    }, 100);
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
                nom: (document.getElementById('register-nom') as HTMLInputElement).value,
                prenom: (document.getElementById('register-prenom') as HTMLInputElement).value,
                email: (document.getElementById('register-email') as HTMLInputElement).value,
                mot_de_passe: (document.getElementById('register-password') as HTMLInputElement).value,
            };
            const result = await window.auth.register(data);
            showMessage(registerMessage, result.message, result.success ? 'success' : 'error');
            if (result.success) {
                (registerForm as HTMLFormElement).reset();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1200);
            }
        });
    }
    if (loginForm) {
        try {
            document.body.style.pointerEvents = 'auto';
        }
        catch (e) { }
        const emailInput = document.getElementById('login-email');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 50);
        }
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                email: (document.getElementById('login-email') as HTMLInputElement).value,
                mot_de_passe: (document.getElementById('login-password') as HTMLInputElement).value,
            };
            const result = await window.auth.login(data);
            showMessage(loginMessage, result.message, result.success ? 'success' : 'error');
            if (result.success) {
                if (result.user) {
                    setCurrentUser(result.user);
                }
                window.location.href = 'tableauDeBord.html';
            }
        });
    }
});
