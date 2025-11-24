function renderMenu() {
    const user = getCurrentUser();
    const nav = document.getElementById('main-menu');
    if (!nav) return;
    let links: Array<{ href: string; label: string; id?: string }> = [];
    if (!user) {
        links = [
            { href: 'index.html', label: 'Connexion' },
            { href: 'register.html', label: 'Inscription' }
        ];
    } else {
        links.push({ href: 'tableauDeBord.html', label: 'Tableau de bord' });
        if ((user.roles || []).includes('Client'))
            links.push({ href: 'restaurants.html', label: 'Restaurants' });
        if ((user.roles || []).includes('Admin'))
            links.push({ href: 'admin.html', label: 'Administration' });
        if ((user.roles || []).includes('Cuisinier') || (user.roles || []).includes('Restaurant')) {
            links.push({ href: 'cuisinier.html', label: 'Cuisinier' });
            links.push({ href: 'commandes-cuisinier.html', label: 'Commandes à préparer' });
        }
        if ((user.roles || []).includes('Livreur')) {
            links.push({ href: 'livreur.html', label: 'Livreur' });
            links.push({ href: 'livraisons.html', label: 'Mes livraisons' });
        }
        links.push({ href: '#', label: 'Déconnexion', id: 'menu-logout' });
    }
    nav.innerHTML = links.map(l => `<a href="${l.href}"${l.id ? ` id='${l.id}'` : ''}>${l.label}</a>`).join(' | ');
    const logout = document.getElementById('menu-logout');
    if (user && logout) {
        logout.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                if (typeof clearSession === 'function') {
                    clearSession();
                    return;
                }
            } catch (err) {
                console.debug('clearSession not available, fallback logout', err);
            }
            sessionStorage.removeItem('currentUser');
            document.body.style.pointerEvents = 'auto';
            window.location.href = 'index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', renderMenu);
