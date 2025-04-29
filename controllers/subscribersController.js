const Subscriber = require("../models/subscriber");

// Afficher la liste des abonnés
exports.getAllSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find({}).lean();
    res.render("subscribers/index", {
      pageTitle: "Liste des abonnés",
      subscribers,
      flashMessages: {
        success: req.flash('success'),
        error: req.flash('error'),
        info: req.flash('info')
      }
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des abonnés: ${error.message}`);
    req.flash('error', 'Erreur lors du chargement des abonnés');
    res.redirect('/');
  }
};

// Afficher le formulaire de nouvel abonnement
exports.getSubscriptionPage = (req, res) => {
  res.render("subscribers/new", {
    pageTitle: "Nouvel abonnement",
    subscriber: {}, // Objet vide pour le formulaire
    flashMessages: {
      error: req.flash('error')
    }
  });
};

// Sauvegarder un nouvel abonné (version web et API)
exports.saveSubscriber = async (req, res) => {
  const { name, email, zipCode } = req.body;

  // Validation des données
  if (!name || !email) {
    if (req.accepts('json')) {
      return res.status(400).json({ 
        status: 400,
        message: "Les champs 'name' et 'email' sont obligatoires" 
      });
    }
    req.flash('error', "Les champs 'name' et 'email' sont obligatoires");
    return res.redirect("/subscribers/new");
  }

  try {
    const newSubscriber = new Subscriber({
      name,
      email,
      zipCode: zipCode || "Non spécifié"
    });

    await newSubscriber.save();

    if (req.accepts('json')) {
      return res.status(201).json({
        status: 201,
        message: "Abonné créé avec succès",
        data: newSubscriber
      });
    }

    res.render("subscribers/thanks", {
      pageTitle: "Merci",
      subscriber: newSubscriber
    });

  } catch (error) {
    console.error("Erreur création abonné:", error);
    
    if (error.code === 11000) { // Erreur de duplication
      const message = "Cet email est déjà utilisé";
      if (req.accepts('json')) {
        return res.status(409).json({ status: 409, message });
      }
      req.flash('error', message);
    } else {
      if (req.accepts('json')) {
        return res.status(500).json({ 
          status: 500, 
          message: "Erreur serveur" 
        });
      }
      req.flash('error', 'Erreur lors de la création');
    }
    
    res.redirect("/subscribers/new");
  }
};

// Voir les détails d'un abonné
exports.show = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id).lean();
    if (!subscriber) {
      req.flash('error', 'Abonné non trouvé');
      return res.redirect('/subscribers');
    }

    res.render("subscribers/show", {
      pageTitle: `Détails - ${subscriber.name}`,
      subscriber
    });
  } catch (error) {
    console.error('Erreur:', error);
    req.flash('error', 'Erreur technique');
    res.redirect('/subscribers');
  }
};

// Supprimer un abonné
exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      req.flash('error', 'Abonné non trouvé');
      return res.redirect('/subscribers');
    }

    req.flash('success', 'Abonné supprimé avec succès');
    res.redirect('/subscribers');
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    req.flash('error', 'Échec de la suppression');
    res.redirect(`/subscribers/${req.params.id}`);
  }
};

// Afficher le formulaire d'édition
exports.editSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id).lean();
    if (!subscriber) {
      req.flash('error', 'Abonné non trouvé');
      return res.redirect('/subscribers');
    }

    res.render("subscribers/edit", {
      pageTitle: "Modifier Abonné",
      subscriber,
      flashMessages: {
        error: req.flash('error')
      }
    });
  } catch (error) {
    req.flash('error', 'Erreur lors du chargement');
    res.redirect('/subscribers');
  }
};

// Mettre à jour un abonné
exports.updateSubscriber = async (req, res) => {
  try {
    const { name, email, zipCode } = req.body;

    if (!name || !email) {
      throw new Error('Les champs "name" et "email" sont obligatoires');
    }

    const subscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { name, email, zipCode },
      { new: true, runValidators: true }
    );

    if (!subscriber) {
      req.flash('error', 'Abonné non trouvé');
      return res.redirect('/subscribers');
    }

    req.flash('success', 'Abonné mis à jour avec succès');
    res.redirect(`/subscribers/${req.params.id}`);
  } catch (error) {
    console.error('Erreur mise à jour:', error);
    req.flash('error', error.message.includes('duplicate') 
      ? 'Cet email est déjà utilisé' 
      : 'Erreur lors de la mise à jour');
    res.redirect(`/subscribers/${req.params.id}/edit`);
  }
};

// Recherche d'abonnés
exports.searchSubscribers = async (req, res) => {
  try {
    const searchTerm = req.query.q?.trim();

    if (!searchTerm) {
      req.flash('info', 'Veuillez entrer un terme de recherche');
      return res.redirect('/subscribers');
    }

    const query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (/^\d+$/.test(searchTerm)) {
      query.$or.push({ zipCode: { $regex: searchTerm } });
    }

    const subscribers = await Subscriber.find(query).lean();

    res.render("subscribers/index", {
      pageTitle: "Résultats de recherche",
      subscribers,
      searchQuery: searchTerm,
      flashMessages: {
        info: subscribers.length === 0 ? 'Aucun résultat trouvé' : undefined
      }
    });

  } catch (error) {
    console.error('Erreur recherche:', error);
    req.flash('error', 'Erreur lors de la recherche');
    res.redirect('/subscribers');
  }
};