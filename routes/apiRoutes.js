const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");

// Route publique pour la documentation (accessible sans token)
router.get("/documentation", (req, res) => {
    res.render("api/documentation", {
        pageTitle: "Documentation API",
        loggedIn: req.isAuthenticated(),
        currentUser: req.user
    });
});

// Authentification API (route publique)
router.post("/login", apiController.apiAuthenticate);

// Middleware de vérification de token pour toutes les autres routes API
router.use((req, res, next) => {
    // Exclure les routes publiques
    if (req.path === "/login" || req.path === "/documentation") {
        return next();
    }
    apiController.verifyToken(req, res, next);
});

// --- Routes protégées ---

// Utilisateurs
router.route("/users")
    .get(apiController.getAllUsers)
    .post(apiController.createUser);

router.route("/users/:id")
    .get(apiController.getUserById)
    .put(apiController.updateUser)
    .delete(apiController.deleteUser);

// Cours
router.route("/courses")
    .get(apiController.getAllCourses)
    .post(apiController.createCourse);

router.route("/courses/:id")
    .get(apiController.getCourseById)
    .put(apiController.updateCourse)
    .delete(apiController.deleteCourse);

// Abonnés
router.route("/subscribers")
    .get(apiController.getAllSubscribers)
    .post(apiController.createSubscriber);

router.route("/subscribers/:id")
    .get(apiController.getSubscriberById)
    .put(apiController.updateSubscriber)
    .delete(apiController.deleteSubscriber);

module.exports = router;