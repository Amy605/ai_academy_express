const express = require("express");
const app = express(); // 👈 DOIT VENIR AVANT LES app.use()
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

app.use(express.json()); // ✅ ok maintenant, car app est déjà défini
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB (sans options dépréciées)
mongoose.connect("mongodb://127.0.0.1:27017/ai_academy");

const db = mongoose.connection;
db.once("open", () => console.log("Connecté à MongoDB avec succès !"));

// Configuration Express
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(layouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method", { methods: ["POST", "GET"] }));

// Configuration des sessions
app.use(cookieParser("secret_passcode_secure"));
app.use(session({
  secret: "secret_passcode_secure",
  cookie: {
    maxAge: 3600000,
    httpOnly: true,
    secure: false
  },
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Configuration Passport
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/user");

if (typeof User.authenticate === "function") {
  passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
} else {
  console.error("❌ ERREUR: La méthode `User.authenticate()` est manquante. As-tu bien configuré `passport-local-mongoose` dans ton modèle ?");
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Variables globales pour les vues
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

// Contrôleurs
const homeController = require("./controllers/homeController");
const authController = require("./controllers/authController");
const usersController = require("./controllers/usersController");
const coursesController = require("./controllers/coursesController");
const subscribersController = require("./controllers/subscribersController");
const errorController = require("./controllers/errorController");

app.post("/users/refresh-token", usersController.refreshToken);

// 🔗 Routes API
const apiRoutes = require("./routes/apiRoutes"); // <-- AJOUTÉ

// Routes d'authentification
app.get("/login", authController.login);
app.post("/login", authController.authenticate);
app.get("/logout", authController.logout);
app.get("/signup", authController.signup);
app.post("/signup", authController.register);

// Pages principales
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

// Middleware de protection
const ensureLoggedIn = authController.ensureLoggedIn;

// 🔐 Routes API token avant /users/:id
app.get("/users/api-token", ensureLoggedIn, usersController.getApiToken);

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

// ✅ Route API activée
app.use("/api", apiRoutes); // <-- AJOUTÉ

// Erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// Lancement du serveur
app.listen(app.get("port"), () => {
  console.log(`✅ Serveur démarré sur http://localhost:${app.get("port")}`);
});
