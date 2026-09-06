import { Navbar } from '/components/navbar/Navbar.js';

const navbarRoot = document.getElementById('navbar');

if (!navbarRoot) {
    throw new Error('Navbar root element not found.');
}

const navbar = new Navbar(navbarRoot, { authenticated: true });

navbar.render();

document.addEventListener('DOMContentLoaded', () => {
    // Dashboard logic will be added here later.
});