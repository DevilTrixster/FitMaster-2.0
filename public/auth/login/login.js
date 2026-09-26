import { Navbar } from '/components/navbar/Navbar.js';
import { setTokens } from '/auth/auth.js';
import { apiJson } from '/common/api.js';

const navbarRoot = document.getElementById('navbar');

if (navbarRoot) {
    const navbar = new Navbar(navbarRoot, { authenticated: false });
    navbar.render();
}

const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

if (!loginForm || !loginMessage) {
    throw new Error('Login page elements not found.');
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    loginMessage.hidden = true;

    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const result = await apiJson('/api/auth/login', {
            method: 'POST',
            body: { email, password }
        }, false);

        setTokens(result);
        window.location.replace('/user/dashboard/dashboard.html');
    } catch (error) {
        loginMessage.textContent = error instanceof Error
            ? error.message
            : 'Произошла ошибка при входе.';
        loginMessage.hidden = false;
    }
});
