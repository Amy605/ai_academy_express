const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

// Routes publiques
router.get("/", homeController.index);
router.get("/about", homeController.about);
router.get("/contact", homeController.contact);
router.post("/contact", homeController.processContact);
router.get("/faq", homeController.faq);
router.get("/thanks", homeController.thanks);

module.exports = router;