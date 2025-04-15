const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const subscribersController = require("./controllers/subscribersController");

// Configuration de la connexion à MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ai_academy", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("Connexion réussie à MongoDB en utilisant Mongoose!");
});

const app = express();

// Configuration du moteur de template
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(layouts);

// Middleware pour traiter les données des formulaires
app.use(express.urlencoded({ extended: true })); // Un seul middleware urlencoded
app.use(express.json());
app.use(methodOverride('_method'));

// Configuration de la session
app.use(session({
  secret: 'votre_secret_plus_complexe',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Configuration de connect-flash
app.use(flash());

// Middleware pour les messages flash
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.errors = req.flash('errors');
  res.locals.formData = req.flash('formData')[0] || {};
  next();
});

// Servir les fichiers statiques
app.use(express.static("public"));

// Routes principales
app.get("/", homeController.index);
app.get("/about", homeController.about);
app.get("/courses", homeController.courses);
app.get("/contact", homeController.contact);
app.post("/contact", homeController.processContact); // Déplacé avec les autres routes contact
app.get("/faq", homeController.faq);
app.get("/thanks", (req, res) => {
  res.render("thanks", {
    pageTitle: "Merci",
    formData: res.locals.formData
  });
});

// Routes des abonnés
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/search", subscribersController.searchSubscribers);
app.get("/subscribers/:id/edit", subscribersController.editSubscriber);
app.put("/subscribers/:id", subscribersController.updateSubscriber);
app.get("/subscribers/:id", subscribersController.show);
app.delete("/subscribers/:id", subscribersController.deleteSubscriber);
app.get("/subscribers", subscribersController.getAllSubscribers);

// Gestion des erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// Démarrer le serveur
app.listen(app.get("port"), () => {
  console.log(`Serveur démarré sur http://localhost:${app.get("port")}`);
});