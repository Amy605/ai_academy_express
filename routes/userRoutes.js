const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authController = require("../controllers/authController");

// ✅ Route spécifique AVANT les routes dynamiques
router.post("/refresh-token", usersController.refreshToken);

// Protection des routes
router.use(authController.ensureLoggedIn);

// Token API
router.get("/api-token", usersController.getApiToken);

// Routes utilisateurs
router.get("/", usersController.index, usersController.indexView);
router.get("/new", usersController.new);
router.post("/create", usersController.create, usersController.redirectView);

// ✅ Routes dynamiques APRÈS les routes fixes
router.get("/:id", usersController.show, usersController.showView);
router.get("/:id/edit", usersController.edit);
router.put("/:id/update", usersController.update, usersController.redirectView);
router.delete("/:id/delete", usersController.delete, usersController.redirectView);

module.exports = router;
