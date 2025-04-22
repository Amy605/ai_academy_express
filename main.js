const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;



// Configuration MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ai_academy", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.once("open", () => console.log("Connecté à MongoDB avec succès !"));

const app = express();

// Configuration de base
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(layouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method", { 
  methods: ["POST", "GET"] 
}));

// Configuration des sessions
app.use(cookieParser("secret_passcode_secure"));
app.use(session({
  secret: "secret_passcode_secure",
  cookie: { 
    maxAge: 3600000, // 1 heure
    httpOnly: true,
    secure: false // À mettre à true en production avec HTTPS
  },
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Configuration Passport
// Configuration Passport
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/user");
passport.use(new LocalStrategy({ 
    usernameField: "email" 
}, User.authenticate()));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Middleware pour variables globales
app.use((req, res, next) => {
  res.locals = {
    currentUser: req.user,
    loggedIn: req.isAuthenticated(),
    flashMessages: {
      success: req.flash("success"),
      error: req.flash("error"),
      info: req.flash("info"),
      authError: req.flash("authError")
    }
  };
  next();
});

// Import des contrôleurs
const homeController = require("./controllers/homeController");
const authController = require("./controllers/authController");
const usersController = require("./controllers/usersController");
const coursesController = require("./controllers/coursesController");
const subscribersController = require("./controllers/subscribersController");
const errorController = require("./controllers/errorController");

// Routes d'authentification
app.get("/login", authController.login);
app.post("/login", authController.authenticate);
app.get("/logout", authController.logout);
app.get("/signup", authController.signup);
app.post("/signup", authController.register);

// Routes principales
app.get("/", homeController.index);
app.get("/about", homeController.about);
app.get("/contact", homeController.contact);
app.post("/contact", homeController.processContact);
app.get("/faq", homeController.faq);
app.get("/thanks", homeController.thanks);

app.get("/api/documentation", (req, res) => {
  res.render("api/documentation", {
    pageTitle: "Documentation API",
    loggedIn: req.isAuthenticated(),
    currentUser: req.user
  });
});

// Routes protégées
const ensureLoggedIn = authController.ensureLoggedIn;

// Routes utilisateurs
app.get("/users", ensureLoggedIn, usersController.index, usersController.indexView);
app.get("/users/new", ensureLoggedIn, usersController.new);
app.post("/users/create", ensureLoggedIn, usersController.create, usersController.redirectView);
app.get("/users/:id", ensureLoggedIn, usersController.show, usersController.showView);
app.get("/users/:id/edit", ensureLoggedIn, usersController.edit);
app.put("/users/:id/update", ensureLoggedIn, usersController.update, usersController.redirectView);
app.delete("/users/:id/delete", ensureLoggedIn, usersController.delete, usersController.redirectView);

// Routes cours
app.get("/courses", coursesController.index, coursesController.indexView);
app.get("/courses/new", ensureLoggedIn, coursesController.new);
app.post("/courses/create", ensureLoggedIn, coursesController.create, coursesController.redirectView);
app.get("/courses/:id", coursesController.show, coursesController.showView);
app.get("/courses/:id/edit", ensureLoggedIn, coursesController.edit);
app.put("/courses/:id/update", ensureLoggedIn, coursesController.update, coursesController.redirectView);
app.delete("/courses/:id/delete", ensureLoggedIn, coursesController.delete, coursesController.redirectView);

// Routes abonnés
app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/search", subscribersController.searchSubscribers);
app.get("/subscribers/:id", subscribersController.show);
app.get("/subscribers/:id/edit", subscribersController.editSubscriber);
app.put("/subscribers/:id", subscribersController.updateSubscriber);
app.delete("/subscribers/:id", subscribersController.deleteSubscriber);

// Gestion des erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// Démarrage du serveur
app.listen(app.get("port"), () => {
  console.log(`Serveur démarré sur http://localhost:${app.get("port")}`);
});