import { Navbar } from '/components/navbar/Navbar.js';

const navbar = document.getElementById('navbar');

if (navbar) {
    const component = new Navbar(navbar, { authenticated: false });

    component.render();
}