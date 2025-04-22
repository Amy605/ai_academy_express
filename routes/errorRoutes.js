const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");

// Gestion des erreurs
router.use(errorController.pageNotFoundError);
router.use(errorController.internalServerError);

module.exports = router;