const User = require("../models/user");
const passport = require("passport");

module.exports = {
  // Affiche le formulaire de connexion
  login: (req, res) => {
    res.render("auth/login", { pageTitle: "Connexion" });
  },

  // Gère l'authentification des utilisateurs
  authenticate: passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Votre email ou mot de passe est incorrect.",
    successRedirect: "/",
    successFlash: "Vous êtes maintenant connecté!"
  }),

  // Déconnecte l'utilisateur (version corrigée)
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.flash("success", "Vous avez été déconnecté avec succès!");
      res.redirect("/");
    });
  },

  // Affiche le formulaire d'inscription
  signup: (req, res) => {
    res.render("auth/signup", { pageTitle: "Inscription" });
  },

  // Crée un nouvel utilisateur (version corrigée)
  register: (req, res, next) => {
    if (req.skip) return next();
    
    const userParams = {
      name: {
        first: req.body.first,
        last: req.body.last
      },
      email: req.body.email,
      zipCode: req.body.zipCode
    };

    User.register(new User(userParams), req.body.password, (error, user) => {
      if (error) {
        req.flash("error", `Échec de la création du compte: ${error.message}`);
        return res.redirect("/signup");
      }
      
      passport.authenticate("local")(req, res, () => {
        req.flash("success", `Bienvenue ${user.fullName}, votre compte a été créé!`);
        res.redirect("/");
      });
    });
  },

  // Middleware de vérification de connexion
  ensureLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash("error", "Veuillez vous connecter pour accéder à cette page.");
    res.redirect("/login");
  },

  // Redirection
  redirectView: (req, res, next) => {
    const redirectPath = res.locals.redirect || "/";
    res.redirect(redirectPath);
  }
};