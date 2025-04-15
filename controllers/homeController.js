// Données des cours
const courses = [
    {
        title: "Introduction à l'IA",
        description: "Découvrez les fondamentaux de l'intelligence artificielle.",
        price: 199,
        level: "Débutant"
    },
    {
        title: "Machine Learning Fondamental",
        description: "Apprenez les principes du machine learning et les algorithmes de base.",
        price: 299,
        level: "Intermédiaire"
    },
    {
        title: "Deep Learning Avancé",
        description: "Maîtrisez les réseaux de neurones profonds et leurs applications.",
        price: 399,
        level: "Avancé"
    }
];

// Données FAQ
const faqs = [
    { 
        question: "Qui peut suivre les cours ?", 
        answer: "Nos cours sont accessibles à tous, quel que soit votre niveau." 
    },
    { 
        question: "Comment s'inscrire ?", 
        answer: "Utilisez le formulaire de contact pour vous inscrire à un cours." 
    },
    { 
        question: "Quelle est la durée des cours ?", 
        answer: "Les cours varient de 4 à 12 semaines selon le niveau." 
    },
    { 
        question: "Y a-t-il des prérequis ?", 
        answer: "Seuls les cours avancés nécessitent des connaissances préalables." 
    },
    { 
        question: "Quand commencent les cours ?", 
        answer: "Nous avons des sessions qui commencent tous les mois." 
    }
];

module.exports = {
    // Page d'accueil
    index: (req, res) => {
        res.render("index", { 
            pageTitle: "Accueil",
            currentRoute: '/'
        });
    },

    // Page À propos
    about: (req, res) => {
        res.render("about", { 
            pageTitle: "À propos",
            currentRoute: '/about'
        });
    },

    // Page Cours
    courses: (req, res) => {
        res.render("courses", {
            pageTitle: "Nos Cours",
            courses: courses,
            currentRoute: '/courses'
        });
    },

    // Page Contact
    contact: (req, res) => {
        res.render("contact", { 
            pageTitle: "Contact",
            currentRoute: '/contact'
        });
    },

    // Traitement du formulaire de contact
    processContact : (req, res) => {
        const { name, email, course, message } = req.body;
        const errors = [];
    
        // Validation du nom
        if (!name || name.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
    
        // Validation de l'email
        if (!email) {
            errors.push('L\'email est obligatoire');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            errors.push('Format d\'email invalide (ex: nom@domaine.com)');
        }
    
        // Validation du cours
        if (!course) {
            errors.push('Veuillez sélectionner un cours');
        }
    
        // Validation du message (optionnel)
        if (message && message.length > 500) {
            errors.push('Le message ne doit pas dépasser 500 caractères');
        }
    
        // Si erreurs, réafficher le formulaire
        if (errors.length > 0) {
            return res.status(400).render('contact', {
                pageTitle: 'Erreur de formulaire',
                errors,
                formData: req.body // Pour pré-remplir les champs
            });
        }
    
        // Si tout est valide
        console.log('Données valides:', { name, email, course, message });
        res.redirect('/thanks');
    },
    // Page FAQ
    faq: (req, res) => {
        res.render("faq", { 
            pageTitle: "FAQ",
            faqs: faqs,
            currentRoute: '/faq'
        });
    },

    // Page Merci
    thanks: (req, res) => {
        res.render("thanks", { 
            pageTitle: "Merci",
            success_msg: req.flash('success')[0],
            error_msg: req.flash('error')[0]
        });
    }
};