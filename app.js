// --- Simple front-end auth + role-guard ---
const USERS = [
    { username: 'manager', password: 'manager90', role: 'manager' },
    { username: 'director', password: 'director90', role: 'director' },
    { username: 'sales', password: 'sales90', role: 'sales' }
];

function setUserSession(user) {
    localStorage.setItem('kgl_user', JSON.stringify(user));
}

function clearUserSession() {
    localStorage.removeItem('kgl_user');
}

function getUserSession() {
    try { return JSON.parse(localStorage.getItem('kgl_user')); } catch (e) { return null; }
}

function showSection(id) {
    document.querySelectorAll('.section, .view').forEach(sec => sec.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function initAuth() {
    const user = getUserSession();
    const loginView = document.getElementById('loginView');

    // Hide everything then selectively reveal depending on auth state
    if (!user) {
        // show login, hide main content
        if (loginView) loginView.classList.remove('hidden');
        document.querySelectorAll('header, nav, footer, main, .app, .content, .sidebar').forEach(el => {
            if (el) el.classList.add('hidden');
        });
    } else {
        if (loginView) loginView.classList.add('hidden');
        document.querySelectorAll('header, nav, footer, main, .app, .content, .sidebar').forEach(el => {
            if (el) el.classList.remove('hidden');
        });
        applyRole(user.role);
    }
}

function applyRole(role) {
    // Trial layout: sidebar menus
    const managerMenu = document.querySelector('.manager-menu');
    const directorMenu = document.querySelector('.director-menu');
    if (managerMenu || directorMenu) {
        if (managerMenu) managerMenu.classList.add('hidden');
        if (directorMenu) directorMenu.classList.add('hidden');
        if (role === 'manager' && managerMenu) managerMenu.classList.remove('hidden');
        if (role === 'director' && directorMenu) directorMenu.classList.remove('hidden');
        // show default view
        if (role === 'manager') showView('procurement');
        if (role === 'director') showView('director');
        return;
    }

    // Root layout: nav buttons -> disable ones not allowed
    document.querySelectorAll('nav button').forEach(btn => btn.disabled = false);
    function disableNavFor(sectionId) {
        const b = Array.from(document.querySelectorAll('nav button')).find(x => x.getAttribute('onclick') && x.getAttribute('onclick').includes(`'${sectionId}'`));
        if (b) b.disabled = true;
    }
    if (role === 'manager') {
        disableNavFor('director');
        showSection('procurement');
    } else if (role === 'sales') {
        disableNavFor('procurement');
        disableNavFor('director');
        showSection('sales');
    } else if (role === 'director') {
        disableNavFor('procurement');
        disableNavFor('sales');
        disableNavFor('credit');
        showSection('director');
    }
}

// Attach login handler if present
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = (document.getElementById('loginUsername') || {}).value || '';
            const password = (document.getElementById('loginPassword') || {}).value || '';
            const user = USERS.find(u => u.username === username && u.password === password);
            if (!user) {
                alert('Invalid credentials. Try demo accounts listed on the form.');
                return;
            }
            setUserSession({ username: user.username, role: user.role });
            initAuth();
        });
    }

    // Wire any logout buttons
    document.querySelectorAll('.logout').forEach(btn => btn.addEventListener('click', () => {
        clearUserSession();
        initAuth();
    }));

    // Initialize existing form handlers safely (only if they exist)
    // Dummy totals for Director View
    let totalProcurement = 0;
    let totalSales = 0;
    let totalCredit = 0;

    const procurementForm = document.getElementById('procurementForm');
    if (procurementForm) procurementForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Produce procurement recorded successfully!');
        totalProcurement += 100000;
        const el = document.getElementById('totalProcurement'); if (el) el.innerText = totalProcurement;
        this.reset();
    });

    const salesForm = document.getElementById('salesForm');
    if (salesForm) salesForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Sale recorded successfully!');
        totalSales += 50000;
        const el = document.getElementById('totalSales'); if (el) el.innerText = totalSales;
        this.reset();
    });

    const creditForm = document.getElementById('creditForm');
    if (creditForm) creditForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Credit sale recorded successfully!');
        totalCredit += 70000;
        const el = document.getElementById('totalCredit'); if (el) el.innerText = totalCredit;
        this.reset();
    });

    // Small helper to show a view id for trial layout
    window.showView = function(id) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
    };

    // Kick off auth check
    initAuth();
});
