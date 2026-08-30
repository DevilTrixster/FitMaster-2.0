const publicNavigationItems = [
    {
        label: 'Войти',
        path: '/auth/login/index.html'
    },
    {
        label: 'Регистрация',
        path: '/auth/registration/index.html'
    }
];

const authenticatedNavigationItems = [
    {
        label: 'Личный кабинет',
        path: '/dashboard'
    },
    {
        label: 'История',
        path: '/history'
    },
    {
        label: 'Прогресс',
        path: '/progress'
    },
    {
        label: 'Профиль',
        path: '/profile'
    }
];

export class Navbar {

    constructor(root, options = {}) {
        this.root = root;
        this.authenticated = options.authenticated ?? false;
    }

    render() {
        this.root.replaceChildren(this.createNavbar());
    }

    createNavbar() {
        const navbar = document.createElement('nav');
        navbar.className = 'navbar';
        navbar.append(this.createBrand(), this.createNavigation());
        return navbar;
    }

    createBrand() {
        const brand = document.createElement('a');
        brand.className = 'nav-brand';
        brand.href = '/';
        const fit = document.createTextNode('Fit');
        const master = document.createElement('span');
        master.className = 'brand-accent';
        master.textContent = 'Master';
        brand.append(fit, master);
        
        return brand;
    }
    createNavigation() {;
        const navigation = document.createElement('div');
        navigation.className = 'nav-user';
        const currentPath = this.getCurrentPath();
        const navigationItems = this.authenticated ? authenticatedNavigationItems : publicNavigationItems;
        for (const item of navigationItems) {
            navigation.appendChild(this.createNavigationLink(item, currentPath));
        }
        return navigation;
    }

    createNavigationLink(item, currentPath) {
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = item.path;
        link.textContent = item.label;
        if (item.path === currentPath) {
            link.classList.add('active');
        }
        return link;
    }

    getCurrentPath() {
        return window.location.pathname;
    }
}
