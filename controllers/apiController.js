const User = require("../models/user");
const Course = require("../models/course");
const Subscriber = require("../models/subscriber");
const httpStatus = require("http-status-codes");
const jsonWebToken = require("jsonwebtoken");
const passport = require("passport");

// Clé secrète pour signer les tokens JWT
const token_key = process.env.TOKEN_KEY || "secretTokenKey";

module.exports = {
  // Middleware pour vérifier les tokens JWT
  verifyToken: (req, res, next) => {
    // Ignorer la vérification pour la route login
    if (req.path === "/login") return next();

    // Vérifier la présence d'un token
    let token = req.query.apiToken || req.headers.authorization;
    if (token) {
      if (token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      // Vérifier la validité du token
      jsonWebToken.verify(token, token_key, (errors, payload) => {
        if (payload) {
          User.findById(payload.data).then(user => {
            if (user) {
              next();
            } else {
              res.status(httpStatus.FORBIDDEN).json({
                error: true,
                message: "Aucun compte utilisateur trouvé."
              });
            }
          });
        } else {
          res.status(httpStatus.UNAUTHORIZED).json({
            error: true,
            message: "Impossible de vérifier le token API."
          });
        }
      });
    } else {
      res.status(httpStatus.UNAUTHORIZED).json({
        error: true,
        message: "Un token API est requis pour cette route."
      });
    }
  },

  // Authentification API
  apiAuthenticate: (req, res, next) => {
    passport.authenticate("local", (errors, user) => {
      if (user) {
        // Générer un token JWT valable pour 1 jour
        let signedToken = jsonWebToken.sign(
          {
            data: user._id,
            exp: new Date().setDate(new Date().getDate() + 1)
          },
          token_key
        );
        res.json({
          success: true,
          token: signedToken,
          user: {
            id: user._id,
            name: user.fullName,
            email: user.email
          }
        });
      } else {
        res.json({
          success: false,
          message: "Impossible d'authentifier l'utilisateur."
        });
      }
    })(req, res, next);
  },

  // Réponses JSON standard
  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals
    });
  },

  // Gestion des erreurs pour l'API
  errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Erreur inconnue."
      };
    }
    res.json(errorObject);
  },

  // Méthodes pour les utilisateurs
  getAllUsers: (req, res, next) => {
    User.find({})
      .then(users => {
        res.locals.users = users;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  getUserById: (req, res, next) => {
    User.findById(req.params.id)
      .then(user => {
        res.locals.user = user;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  createUser: (req, res, next) => {
    let userParams = {
      name: {
        first: req.body.first,
        last: req.body.last
      },
      email: req.body.email,
      password: req.body.password,
      zipCode: req.body.zipCode
    };

    User.register(new User(userParams), req.body.password)
      .then(user => {
        res.locals.user = user;
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  updateUser: (req, res, next) => {
    let userId = req.params.id;
    let userParams = {
      name: {
        first: req.body.first,
        last: req.body.last
      },
      email: req.body.email,
      zipCode: req.body.zipCode
    };

    User.findByIdAndUpdate(userId, { $set: userParams })
      .then(user => {
        res.locals.user = user;
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  deleteUser: (req, res, next) => {
    let userId = req.params.id;
    User.findByIdAndRemove(userId)
      .then(() => {
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  // Méthodes pour les cours
  getAllCourses: (req, res, next) => {
    Course.find({})
      .then(courses => {
        res.locals.courses = courses;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  getCourseById: (req, res, next) => {
    Course.findById(req.params.id)
      .then(course => {
        res.locals.course = course;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  createCourse: (req, res, next) => {
    let courseParams = {
      title: req.body.title,
      description: req.body.description,
      maxStudents: req.body.maxStudents,
      cost: req.body.cost
    };

    Course.create(courseParams)
      .then(course => {
        res.locals.course = course;
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  updateCourse: (req, res, next) => {
    let courseId = req.params.id;
    let courseParams = {
      title: req.body.title,
      description: req.body.description,
      maxStudents: req.body.maxStudents,
      cost: req.body.cost
    };

    Course.findByIdAndUpdate(courseId, { $set: courseParams })
      .then(course => {
        res.locals.course = course;
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  deleteCourse: (req, res, next) => {
    let courseId = req.params.id;
    Course.findByIdAndRemove(courseId)
      .then(() => {
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  // Méthodes pour les abonnés
  getAllSubscribers: (req, res, next) => {
    Subscriber.find({})
      .then(subscribers => {
        res.locals.subscribers = subscribers;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  getSubscriberById: (req, res, next) => {
    Subscriber.findById(req.params.id)
      .then(subscriber => {
        res.locals.subscriber = subscriber;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  createSubscriber: (req, res, next) => {
    let subscriberParams = {
      name: req.body.name,
      email: req.body.email,
      zipCode: req.body.zipCode
    };

    Subscriber.create(subscriberParams)
      .then(subscriber => {
        res.locals.subscriber = subscriber;
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  updateSubscriber: (req, res, next) => {
    let subscriberId = req.params.id;
    let subscriberParams = {
      name: req.body.name,
      email: req.body.email,
      zipCode: req.body.zipCode
    };

    Subscriber.findByIdAndUpdate(subscriberId, { $set: subscriberParams })
      .then(subscriber => {
        res.locals.subscriber = subscriber;
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  },

  deleteSubscriber: (req, res, next) => {
    let subscriberId = req.params.id;
    Subscriber.findByIdAndRemove(subscriberId)
      .then(() => {
        res.locals.success = true;
        next();
      })
      .catch(error => {
        next(error);
      });
  }
};