import { Navbar } from '/components/navbar/Navbar.js';

const navbarRoot =
    document.getElementById('navbar');

if (navbarRoot) {
    const navbar =
        new Navbar(navbarRoot, {
            authenticated: false
        });

    navbar.render();
}

const loginForm =
    document.getElementById('loginForm');

const loginMessage =
    document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData =
        new FormData(loginForm);

    const email =
        formData.get('email');

    const password =
        formData.get('password');

    try {
        const response =
            await fetch('/api/auth/login', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    email,
                    password
                })
            });

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ??
                'Не удалось выполнить вход.'
            );
        }

        localStorage.setItem(
            'accessToken',
            result.accessToken
        );

        localStorage.setItem(
            'refreshToken',
            result.refreshToken
        );

        window.location.href =
            '/user/dashboard/dashboard.html';

    } catch (error) {

        loginMessage.textContent =
            error instanceof Error
                ? error.message
                : 'Произошла ошибка при входе.';

        loginMessage.hidden = false;
    }
});