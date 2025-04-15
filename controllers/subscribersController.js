const Subscriber = require("../models/subscriber"); 
exports.getAllSubscribers = (req, res, next) => {
    Subscriber.find({})
      .exec()
      .then(subscribers => {
        res.render("subscribers/index", {
          pageTitle: "Liste des abonnés",  
          subscribers: subscribers
        });
      })
      .catch(error => {
        console.log(`Erreur lors de la récupération des abonnés: ${error.message}`);
        next(error);
      });
  };
  
  exports.getSubscriptionPage = (req, res) => {
    res.render("subscribers/new", {
      pageTitle: "Nouvel abonnement"  // Ajouté
    });
  };
  
  exports.saveSubscriber = (req, res) => {
    let newSubscriber = new Subscriber({
      name: req.body.name,
      email: req.body.email,
      zipCode: req.body.zipCode
    });
    newSubscriber.save()
      .then(result => {
        res.render("subscribers/thanks", {
          pageTitle: "Merci"  // Ajouté
        });
      })
      .catch(error => {
        if (error) res.send(error);
      });
  };
  
  exports.show = async (req, res) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id);
        
        if (!subscriber) {
            req.flash('error', 'Abonné non trouvé');
            return res.redirect('/subscribers');
        }

        res.render("subscribers/show", {
            pageTitle: `Détails - ${subscriber.name}`,
            subscriber: subscriber
        });
    } catch (error) {
        console.error('Erreur:', error);
        req.flash('error', 'Erreur technique');
        res.redirect('/subscribers');
    }
};
exports.deleteSubscriber = async (req, res) => {
    try {
      await Subscriber.findByIdAndDelete(req.params.id);
      req.flash('success', 'Abonné supprimé avec succès');
      res.redirect('/subscribers');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      req.flash('error', 'Échec de la suppression');
      res.redirect(`/subscribers/${req.params.id}`);
    }
  };
  // Afficher le formulaire de modification
exports.editSubscriber = async (req, res) => {
    try {
      const subscriber = await Subscriber.findById(req.params.id);
      res.render("subscribers/edit", {
        pageTitle: "Modifier Abonné",
        subscriber: subscriber
      });
    } catch (error) {
      req.flash('error', 'Erreur lors du chargement');
      res.redirect('/subscribers');
    }
  };
  
  // Traiter la modification
  exports.updateSubscriber = async (req, res) => {
    try {
      const { name, email, zipCode } = req.body;
      
      // Validation
      if (!name || !email || !zipCode) {
        throw new Error('Tous les champs sont requis');
      }
  
      await Subscriber.findByIdAndUpdate(req.params.id, {
        name,
        email,
        zipCode
      });
  
      req.flash('success', 'Abonné mis à jour');
      res.redirect(`/subscribers/${req.params.id}`);
    } catch (error) {
      req.flash('error', error.message);
      res.redirect(`/subscribers/${req.params.id}/edit`);
    }
  };
  exports.searchSubscribers = async (req, res) => {
    try {
      const searchTerm = req.query.q?.trim();
      
      if (!searchTerm) {
        req.flash('info', 'Veuillez entrer un terme de recherche');
        return res.redirect('/subscribers');
      }
  
      const query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } }
        ]
      };
  
      // Si le terme est numérique, recherche aussi dans zipCode
      if (/^\d+$/.test(searchTerm)) {
        query.$or.push({ zipCode: { $regex: searchTerm } });
      }
  
      const subscribers = await Subscriber.find(query);
  
      res.render("subscribers/index", {
        pageTitle: "Résultats de recherche",
        subscribers,
        searchQuery: searchTerm
      });
  
    } catch (error) {
      console.error('Erreur recherche:', error);
      req.flash('error', 'Erreur lors de la recherche');
      res.redirect('/subscribers');
    }
  };
  
  