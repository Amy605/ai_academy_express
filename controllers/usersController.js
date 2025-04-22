const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Fonction utilitaire pour extraire les paramètres utilisateur
const getUserParams = (body) => ({
  name: {
    first: body.first,
    last: body.last,
  },
  email: body.email,
  password: body.password,
  zipCode: body.zipCode,
});

// Middleware de validation d'ID
const validateUserId = (req, res, next) => {
  const userId = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).render("error", {
      errorCode: 400,
      message: "ID utilisateur invalide",
      layout: "layout"
    });
  }
  next();
};

module.exports = {
  // Liste tous les utilisateurs
  index: async (req, res, next) => {
    try {
      const users = await User.find({});
      res.locals.users = users;
      next();
    } catch (error) {
      console.error(`Erreur récupération utilisateurs: ${error.message}`);
      next(error);
    }
  },

  indexView: (req, res) => {
    res.render("users/index");
  },

  // Nouvel utilisateur
  new: (req, res) => {
    res.render("users/new");
  },

  create: async (req, res, next) => {
    try {
      const user = await User.create(getUserParams(req.body));
      req.flash("success", "Utilisateur créé avec succès");
      res.locals.redirect = "/users";
      res.locals.user = user;
      next();
    } catch (error) {
      console.error(`Erreur création utilisateur: ${error.message}`);
      req.flash("error", "Erreur lors de la création");
      res.locals.redirect = "/users/new";
      next();
    }
  },

  // Affichage utilisateur
  show: [validateUserId, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).render("error", {
          errorCode: 404,
          message: "Utilisateur non trouvé",
          layout: "layout"
        });
      }
      res.locals.user = user;
      next();
    } catch (error) {
      console.error(`Erreur récupération utilisateur: ${error.message}`);
      res.status(500).render("error", {
        errorCode: 500,
        message: "Erreur serveur",
        layout: "layout"
      });
    }
  }],

  showView: (req, res) => {
    res.render("users/show");
  },

  // Édition utilisateur
  edit: [validateUserId, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      res.render("users/edit", { user });
    } catch (error) {
      console.error(`Erreur récupération utilisateur: ${error.message}`);
      next(error);
    }
  }],

  update: [validateUserId, async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: getUserParams(req.body) },
        { new: true }
      );
      req.flash("success", "Utilisateur mis à jour");
      res.locals.redirect = `/users/${req.params.id}`;
      res.locals.user = user;
      next();
    } catch (error) {
      console.error(`Erreur mise à jour utilisateur: ${error.message}`);
      next(error);
    }
  }],

  // Suppression utilisateur
  delete: [validateUserId, async (req, res, next) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      req.flash("success", "Utilisateur supprimé");
      res.locals.redirect = "/users";
      next();
    } catch (error) {
      console.error(`Erreur suppression utilisateur: ${error.message}`);
      next();
    }
  }],

  redirectView: (req, res, next) => {
    const redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  // Gestion des tokens API
  getApiToken: async (req, res) => {
    try {
        // Vérifier que l'utilisateur est bien authentifié
        if (!req.isAuthenticated()) {
            req.flash("error", "Vous devez être connecté pour accéder à cette page");
            return res.redirect("/login");
        }

        // Vérifier que req.user est bien défini
        if (!req.user || !req.user._id) {
            console.error("Erreur: Utilisateur non défini dans la requête");
            throw new Error("Erreur d'authentification");
        }

        // Générer le token JWT
        const token = jwt.sign(
            { 
                userId: req.user._id,
                email: req.user.email 
            },
            process.env.JWT_SECRET || "votre_cle_secrete_par_defaut",
            { expiresIn: "30d" }
        );

        // Rendre la vue avec le token
        res.render("users/api-token", {
            token,
            currentUser: req.user,
            pageTitle: "Votre Token API",
            layout: "layout"
        });

    } catch (error) {
        console.error("Erreur dans getApiToken:", error.message);
        req.flash("error", "Erreur lors de la génération du token");
        res.redirect("/users");
    }
}
};