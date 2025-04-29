const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Configuration sécurisée
const TOKEN_SECRET = process.env.TOKEN_SECRET || "default_token_key_secure_please_change";
const TOKEN_EXPIRATION = "1h";
const API_TOKEN_EXPIRATION = "30d";
const REFRESH_TOKEN_EXPIRATION = "7d";

// Fonction utilitaire pour extraire les paramètres utilisateur
const getUserParams = (body) => {
  return {
    name: {
      first: body.first,
      last: body.last
    },
    email: body.email,
    zipCode: body.zipCode
  };
};

module.exports = {
  // Liste tous les utilisateurs
  index: async (req, res, next) => {
    try {
      const users = await User.find({}).select('-__v -password');
      res.locals.users = users;
      next();
    } catch (error) {
      console.error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
      next(error);
    }
  },

  indexView: (req, res) => {
    res.render("users/index", { users: res.locals.users });
  },

  new: (req, res) => {
    res.render("users/new");
  },

  create: async (req, res, next) => {
    const userParams = getUserParams(req.body);
    
    try {
      const user = await User.register(new User(userParams), req.body.password);
      req.flash("success", `${user.name.first} a été créé avec succès !`);
      res.locals.redirect = "/users";
      res.locals.user = user;
      next();
    } catch (error) {
      console.error(`Erreur création utilisateur: ${error.message}`);
      req.flash("error", `Erreur création: ${error.message}`);
      res.locals.redirect = "/users/new";
      next();
    }
  },

  redirectView: (req, res, next) => {
    const redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  show: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        req.flash("error", "Utilisateur non trouvé");
        return res.redirect("/users");
      }
      res.locals.user = user;
      next();
    } catch (error) {
      console.error(`Erreur récupération utilisateur: ${error.message}`);
      next(error);
    }
  },

  showView: (req, res) => {
    res.render("users/show", { user: res.locals.user });
  },

  edit: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        req.flash("error", "Utilisateur non trouvé");
        return res.redirect("/users");
      }
      res.render("users/edit", { user });
    } catch (error) {
      console.error(`Erreur édition utilisateur: ${error.message}`);
      next(error);
    }
  },

  update: async (req, res, next) => {
    const userId = req.params.id;
    const userParams = getUserParams(req.body);

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: userParams },
        { new: true, runValidators: true }
      );

      if (!user) {
        req.flash("error", "Utilisateur non trouvé");
        return res.redirect("/users");
      }

      req.flash("success", "Profil mis à jour avec succès");
      res.locals.redirect = `/users/${userId}`;
      res.locals.user = user;
      next();
    } catch (error) {
      console.error(`Erreur mise à jour: ${error.message}`);
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        req.flash("error", "Utilisateur non trouvé");
        return res.redirect("/users");
      }
      req.flash("success", `${user.name.first} a été supprimé avec succès.`);
      res.locals.redirect = "/users";
      next();
    } catch (error) {
      console.error(`Erreur suppression: ${error.message}`);
      next(error);
    }
  },

  getApiToken: async (req, res) => {
    if (!req.user) {
      req.flash("error", "Authentification requise");
      return res.redirect("/login");
    }

    try {
      const signedToken = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email
        },
        TOKEN_SECRET,
        { expiresIn: API_TOKEN_EXPIRATION }
      );

      res.render("users/api-token", {
        token: signedToken,
        expiration: API_TOKEN_EXPIRATION
      });
    } catch (error) {
      console.error(`Erreur génération token: ${error.message}`);
      req.flash("error", "Erreur lors de la génération du token");
      res.redirect("/profile");
    }
  },

  verifyToken: async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Token d'authentification manquant"
      });
    }

    try {
      const decoded = await jwt.verify(token, TOKEN_SECRET);
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      console.error("Erreur vérification token:", error);
      return res.status(403).json({
        error: true,
        message: "Token invalide ou expiré"
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: true, message: "Authorization header manquant ou mal formé." });
      }

      const token = authHeader.split(" ")[1];
      const decoded = await jwt.verify(token, TOKEN_SECRET);
      const userExists = await User.findById(decoded.id);

      if (!userExists) {
        return res.status(404).json({ error: true, message: "Utilisateur associé au token non trouvé." });
      }

      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role || 'user' },
        TOKEN_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );

      return res.json({
        success: true,
        token: newToken,
        expiresIn: 3600
      });

    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      const message = error.name === 'TokenExpiredError'
        ? "Token expiré. Veuillez vous reconnecter."
        : "Token invalide.";
      return res.status(403).json({ error: true, message });
    }
  }
};
