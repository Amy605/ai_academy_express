const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");


// API Routes
router.use(apiController.verifyToken);//

// Utilisateurs
router.get("/users", apiController.getAllUsers, apiController.respondJSON);
router.get("/users/:id", apiController.getUserById, apiController.respondJSON);
router.post("/users", apiController.createUser, apiController.respondJSON);
router.put("/users/:id", apiController.updateUser, apiController.respondJSON);
router.delete("/users/:id", apiController.deleteUser, apiController.respondJSON);

// Cours
router.get("/courses", apiController.getAllCourses, apiController.respondJSON);
router.get("/courses/:id", apiController.getCourseById, apiController.respondJSON);
router.post("/courses", apiController.createCourse, apiController.respondJSON);
router.put("/courses/:id", apiController.updateCourse, apiController.respondJSON);
router.delete("/courses/:id", apiController.deleteCourse, apiController.respondJSON);

// Abonnés
router.get("/subscribers", apiController.getAllSubscribers, apiController.respondJSON);
router.get("/subscribers/:id", apiController.getSubscriberById, apiController.respondJSON);
router.post("/subscribers", apiController.createSubscriber, apiController.respondJSON);
router.put("/subscribers/:id", apiController.updateSubscriber, apiController.respondJSON);
router.delete("/subscribers/:id", apiController.deleteSubscriber, apiController.respondJSON);

// Authentification et documentation
router.post("/login", apiController.apiAuthenticate);
router.get("/documentation", (req, res) => {
  res.render("api/documentation");
});

// Gestion des erreurs
router.use(apiController.errorJSON);

module.exports = router;