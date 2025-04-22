const User = require("../models/user");
const Course = require("../models/course");
const Subscriber = require("../models/subscriber");
const httpStatus = require("http-status-codes");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// Configuration
const tokenKey = process.env.TOKEN_KEY || "secretTokenKey";
const tokenExpiration = process.env.TOKEN_EXPIRATION || "1d";

module.exports = {
  /**
   * Middleware de vérification de token JWT
   */
  verifyToken: async (req, res, next) => {
    try {
      // Ignorer les routes publiques
      if (req.path === "/login" || req.path === "/documentation") {
        return next();
      }

      // Récupérer le token depuis les headers ou query params
      let token = req.query.apiToken || req.headers.authorization;
      
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          error: true,
          message: "Token API requis",
          details: "Ajoutez le token dans l'en-tête Authorization ou comme paramètre apiToken"
        });
      }

      // Nettoyer le token Bearer
      if (token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      // Vérifier et décoder le token
      const decoded = await jwt.verify(token, tokenKey);
      
      // Vérifier que l'utilisateur existe toujours
      const user = await User.findById(decoded.data);
      if (!user) {
        return res.status(httpStatus.FORBIDDEN).json({
          error: true,
          message: "Utilisateur non trouvé"
        });
      }

      // Ajouter l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      console.error("Erreur de vérification du token:", error.message);
      
      let message = "Token invalide";
      if (error.name === "TokenExpiredError") {
        message = "Token expiré";
      } else if (error.name === "JsonWebTokenError") {
        message = "Token malformé";
      }

      return res.status(httpStatus.UNAUTHORIZED).json({
        error: true,
        message: message,
        details: error.message
      });
    }
  },

  /**
   * Authentification API
   */
  apiAuthenticate: (req, res, next) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: "Erreur d'authentification",
          details: error.message
        });
      }

      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          error: true,
          message: info.message || "Authentification échouée"
        });
      }

      // Générer le token JWT
      const token = jwt.sign(
        {
          data: user._id,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 heures
        },
        tokenKey
      );

      // Réponse avec token
      res.json({
        success: true,
        token: token,
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email
        }
      });
    })(req, res, next);
  },

  /**
   * Formatter les réponses JSON
   */
  respondJSON: (req, res) => {
    const response = {
      status: httpStatus.OK,
      data: res.locals.data || res.locals
    };
    
    // Filtrer les données sensibles
    if (response.data.user) {
      response.data.user = this._filterUserData(response.data.user);
    }
    
    res.json(response);
  },

  /**
   * Gestion des erreurs API
   */
  errorJSON: (error, req, res, next) => {
    console.error("Erreur API:", error);
    
    const status = error.status || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || "Erreur inconnue";
    
    res.status(status).json({
      status: status,
      error: true,
      message: message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  },

  // Méthode utilitaire pour filtrer les données utilisateur sensibles
  _filterUserData: (user) => {
    if (!user) return null;
    
    if (user.toObject) {
      user = user.toObject();
    }
    
    const filtered = {
      id: user._id,
      name: user.name,
      email: user.email,
      zipCode: user.zipCode
    };
    
    return filtered;
  },

  /**
   * CRUD Utilisateurs
   */
  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.find({});
      res.locals.data = { users: users.map(this._filterUserData) };
      next();
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Utilisateur non trouvé"
        });
      }
      res.locals.data = { user: this._filterUserData(user) };
      next();
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const userParams = {
        name: {
          first: req.body.first,
          last: req.body.last
        },
        email: req.body.email,
        password: req.body.password,
        zipCode: req.body.zipCode
      };

      const user = await User.create(userParams);
      res.locals.data = { user: this._filterUserData(user) };
      next();
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const userParams = {
        name: {
          first: req.body.first,
          last: req.body.last
        },
        email: req.body.email,
        zipCode: req.body.zipCode
      };

      const user = await User.findByIdAndUpdate(
        userId, 
        { $set: userParams },
        { new: true }
      );
      
      if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Utilisateur non trouvé"
        });
      }
      
      res.locals.data = { user: this._filterUserData(user) };
      next();
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await User.findByIdAndDelete(userId);
      
      if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Utilisateur non trouvé"
        });
      }
      
      res.locals.data = { success: true };
      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * CRUD Cours
   */
  getAllCourses: async (req, res, next) => {
    try {
      const courses = await Course.find({});
      res.locals.data = { courses };
      next();
    } catch (error) {
      next(error);
    }
  },

  getCourseById: async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Cours non trouvé"
        });
      }
      res.locals.data = { course };
      next();
    } catch (error) {
      next(error);
    }
  },

  createCourse: async (req, res, next) => {
    try {
      const courseParams = {
        title: req.body.title,
        description: req.body.description,
        maxStudents: req.body.maxStudents,
        cost: req.body.cost
      };

      const course = await Course.create(courseParams);
      res.locals.data = { course };
      next();
    } catch (error) {
      next(error);
    }
  },

  updateCourse: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const courseParams = {
        title: req.body.title,
        description: req.body.description,
        maxStudents: req.body.maxStudents,
        cost: req.body.cost
      };

      const course = await Course.findByIdAndUpdate(
        courseId,
        { $set: courseParams },
        { new: true }
      );
      
      if (!course) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Cours non trouvé"
        });
      }
      
      res.locals.data = { course };
      next();
    } catch (error) {
      next(error);
    }
  },

  deleteCourse: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const course = await Course.findByIdAndDelete(courseId);
      
      if (!course) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Cours non trouvé"
        });
      }
      
      res.locals.data = { success: true };
      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * CRUD Abonnés
   */
  getAllSubscribers: async (req, res, next) => {
    try {
      const subscribers = await Subscriber.find({});
      res.locals.data = { subscribers };
      next();
    } catch (error) {
      next(error);
    }
  },

  getSubscriberById: async (req, res, next) => {
    try {
      const subscriber = await Subscriber.findById(req.params.id);
      if (!subscriber) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Abonné non trouvé"
        });
      }
      res.locals.data = { subscriber };
      next();
    } catch (error) {
      next(error);
    }
  },

  createSubscriber: async (req, res, next) => {
    try {
      const subscriberParams = {
        name: req.body.name,
        email: req.body.email,
        zipCode: req.body.zipCode
      };

      const subscriber = await Subscriber.create(subscriberParams);
      res.locals.data = { subscriber };
      next();
    } catch (error) {
      next(error);
    }
  },

  updateSubscriber: async (req, res, next) => {
    try {
      const subscriberId = req.params.id;
      const subscriberParams = {
        name: req.body.name,
        email: req.body.email,
        zipCode: req.body.zipCode
      };

      const subscriber = await Subscriber.findByIdAndUpdate(
        subscriberId,
        { $set: subscriberParams },
        { new: true }
      );
      
      if (!subscriber) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Abonné non trouvé"
        });
      }
      
      res.locals.data = { subscriber };
      next();
    } catch (error) {
      next(error);
    }
  },

  deleteSubscriber: async (req, res, next) => {
    try {
      const subscriberId = req.params.id;
      const subscriber = await Subscriber.findByIdAndDelete(subscriberId);
      
      if (!subscriber) {
        return res.status(httpStatus.NOT_FOUND).json({
          error: true,
          message: "Abonné non trouvé"
        });
      }
      
      res.locals.data = { success: true };
      next();
    } catch (error) {
      next(error);
    }
  }
};