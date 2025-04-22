const express = require("express");
const router = express.Router();
const subscribersController = require("../controllers/subscribersController");
const authController = require("../controllers/authController");

// Middleware de protection
router.use(authController.ensureLoggedIn);

// Routes pour les abonnés
router.get("/", subscribersController.getAllSubscribers);
router.get("/new", subscribersController.getSubscriptionPage);
router.post("/create", subscribersController.saveSubscriber);
router.get("/search", subscribersController.searchSubscribers);
router.get("/:id", subscribersController.show);
router.get("/:id/edit", subscribersController.editSubscriber);
router.put("/:id", subscribersController.updateSubscriber);
router.delete("/:id", subscribersController.deleteSubscriber);

module.exports = router;