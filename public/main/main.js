import { Navbar } from '/components/navbar/navbar.js';

const navbar = document.getElementById('navbar');

if (navbar) {
    const component = new Navbar(navbar, { authenticated: false });

    component.render();
}