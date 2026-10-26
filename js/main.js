/* =========================================================
   Alliance Tounga-djè : interactions du site
   ========================================================= */

/* Coordonnées de l'association, à renseigner.
   whatsapp : numéro au format international, chiffres seulement (ex. 2250700000000).
   Tant que ces deux champs sont vides, les formulaires préviennent le visiteur. */
const CONFIG = {
    whatsapp: '33689305321',
    email: 'alliance.td@outlook.com'
};

const MONTANTS = {
    FCFA: [5000, 10000, 25000, 50000],
    EUR: [10, 20, 50, 100]
};

document.documentElement.classList.add('js');

const formatMontant = (valeur, devise) =>
    devise === 'EUR'
        ? `${valeur.toLocaleString('fr-FR')} €`
        : `${valeur.toLocaleString('fr-FR')} FCFA`;

/* Envoie le message par WhatsApp en priorité, sinon par e-mail. */
function envoyer(sujet, texte) {
    if (CONFIG.whatsapp) {
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texte)}`, '_blank', 'noopener');
        return true;
    }
    if (CONFIG.email) {
        window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(texte)}`;
        return true;
    }
    return false;
}

function afficherNote(form, message, succes) {
    const note = form.querySelector('.form-note');
    note.textContent = message;
    note.classList.toggle('is-success', succes);
}

/* ---------- Menu mobile ---------- */
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');

function fermerMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Ouvrir le menu';
}

toggle.addEventListener('click', () => {
    const ouvert = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(ouvert));
    toggle.querySelector('.sr-only').textContent = ouvert ? 'Fermer le menu' : 'Ouvrir le menu';
});

menu.querySelectorAll('a').forEach((lien) => lien.addEventListener('click', fermerMenu));
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        fermerMenu();
        toggle.focus();
    }
});

/* ---------- En-tête au défilement ---------- */
const majHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
majHeader();
window.addEventListener('scroll', majHeader, { passive: true });

/* ---------- Lien actif dans le menu ---------- */
const liensNav = [...document.querySelectorAll('.main-nav li a')];
const sectionsNav = liensNav
    .map((lien) => document.querySelector(lien.getAttribute('href')))
    .filter(Boolean);

if ('IntersectionObserver' in window) {
    const espion = new IntersectionObserver((entrees) => {
        entrees.forEach((entree) => {
            if (!entree.isIntersecting) return;
            liensNav.forEach((lien) => {
                const actif = lien.getAttribute('href') === `#${entree.target.id}`;
                lien.classList.toggle('is-active', actif);
                if (actif) lien.setAttribute('aria-current', 'true');
                else lien.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionsNav.forEach((section) => espion.observe(section));

    /* ---------- Apparition au défilement ---------- */
    const apparition = new IntersectionObserver((entrees, obs) => {
        entrees.forEach((entree) => {
            if (!entree.isIntersecting) return;
            entree.target.classList.add('is-visible');
            obs.unobserve(entree.target);
        });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => apparition.observe(el));
} else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Filtre des actions ---------- */
const puces = document.querySelectorAll('.filters .chip');
const cartes = document.querySelectorAll('#actions-liste .card');
const vide = document.querySelector('#actions .empty-state');

puces.forEach((puce) => {
    puce.addEventListener('click', () => {
        const filtre = puce.dataset.filter;
        puces.forEach((p) => {
            const actif = p === puce;
            p.classList.toggle('is-active', actif);
            p.setAttribute('aria-pressed', String(actif));
        });
        let visibles = 0;
        cartes.forEach((carte) => {
            const montrer = filtre === 'tous' || carte.dataset.domaine === filtre;
            carte.hidden = !montrer;
            if (montrer) {
                carte.classList.add('is-visible');
                visibles++;
            }
        });
        vide.hidden = visibles > 0;
    });
});

/* ---------- Choix du profil depuis « Agir avec nous » ---------- */
const objetContact = document.getElementById('c-objet');
document.querySelectorAll('[data-profil]').forEach((lien) => {
    lien.addEventListener('click', () => {
        objetContact.value = lien.dataset.profil;
    });
});

/* ---------- Formulaire de don ---------- */
const formDon = document.getElementById('form-don');
const grilleMontants = document.getElementById('montants');
const champAutre = document.getElementById('don-autre');
const resume = document.getElementById('don-resume');
const deviseAffichee = document.getElementById('don-devise');

const deviseActive = () => formDon.querySelector('input[name="devise"]:checked').value;

function montantChoisi() {
    const autre = Number(champAutre.value);
    if (autre > 0) return autre;
    const coche = formDon.querySelector('input[name="montant"]:checked');
    return coche ? Number(coche.value) : 0;
}

function majResume() {
    const montant = montantChoisi();
    resume.textContent = montant ? formatMontant(montant, deviseActive()) : '…';
}

function dessinerMontants() {
    const devise = deviseActive();
    grilleMontants.innerHTML = MONTANTS[devise].map((valeur, i) => `
        <label>
            <input type="radio" name="montant" value="${valeur}" ${i === 1 ? 'checked' : ''}>
            <span>${formatMontant(valeur, devise)}</span>
        </label>`).join('');
    deviseAffichee.textContent = devise === 'EUR' ? '€' : 'FCFA';
    champAutre.value = '';
    majResume();
}

formDon.addEventListener('change', (e) => {
    if (e.target.name === 'devise') dessinerMontants();
    if (e.target.name === 'montant') {
        champAutre.value = '';
        majResume();
    }
});
champAutre.addEventListener('input', () => {
    if (champAutre.value) formDon.querySelectorAll('input[name="montant"]').forEach((r) => { r.checked = false; });
    majResume();
});

formDon.addEventListener('submit', (e) => {
    e.preventDefault();
    const nom = document.getElementById('don-nom');
    const erreur = document.getElementById('don-nom-erreur');
    const montant = montantChoisi();

    if (!nom.value.trim()) {
        nom.setAttribute('aria-invalid', 'true');
        erreur.hidden = false;
        nom.focus();
        return;
    }
    nom.removeAttribute('aria-invalid');
    erreur.hidden = true;

    if (!montant) {
        afficherNote(formDon, 'Choisissez un montant ou saisissez le vôtre.', false);
        return;
    }

    const texte = `Bonjour, je m'appelle ${nom.value.trim()} et je souhaite faire un don de ${formatMontant(montant, deviseActive())} à l'Alliance Tounga-djè. Pouvez-vous m'indiquer comment procéder ?`;
    if (envoyer('Annonce de don', texte)) {
        afficherNote(formDon, 'Merci ! Votre message est prêt, il ne reste qu\'à l\'envoyer.', true);
    } else {
        afficherNote(formDon, 'Les coordonnées de l\'association seront bientôt en ligne. Merci de revenir très vite !', false);
    }
});

dessinerMontants();

/* ---------- Formulaire de contact ---------- */
const formContact = document.getElementById('form-contact');

formContact.addEventListener('submit', (e) => {
    e.preventDefault();
    let premierInvalide = null;

    formContact.querySelectorAll('[required]').forEach((champ) => {
        const invalide = !champ.value.trim();
        const erreur = champ.parentElement.querySelector('.field-error');
        if (invalide) champ.setAttribute('aria-invalid', 'true');
        else champ.removeAttribute('aria-invalid');
        if (erreur) erreur.hidden = !invalide;
        if (invalide && !premierInvalide) premierInvalide = champ;
    });

    if (premierInvalide) {
        premierInvalide.focus();
        return;
    }

    const donnees = new FormData(formContact);
    const texte = `${donnees.get('objet')}\n\nNom : ${donnees.get('nom')}\nContact : ${donnees.get('joindre')}\n\n${donnees.get('message')}`;
    if (envoyer(`${donnees.get('objet')} : ${donnees.get('nom')}`, texte)) {
        afficherNote(formContact, 'Merci ! Votre message est prêt, il ne reste qu\'à l\'envoyer.', true);
        formContact.reset();
    } else {
        afficherNote(formContact, 'Les coordonnées de l\'association seront bientôt en ligne. Merci de revenir très vite !', false);
    }
});

/* ---------- Coordonnées affichées ---------- */
const coordonnees = document.getElementById('coordonnees');
if (CONFIG.whatsapp) {
    coordonnees.insertAdjacentHTML('beforeend', `
        <li><a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">
            <span class="card-icon icon-green"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/></svg></span>
            Écrire sur WhatsApp</a></li>`);
}
if (CONFIG.email) {
    coordonnees.insertAdjacentHTML('beforeend', `
        <li><a href="mailto:${CONFIG.email}">
            <span class="card-icon icon-orange"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></span>
            ${CONFIG.email}</a></li>`);
}

document.getElementById('annee').textContent = new Date().getFullYear();
