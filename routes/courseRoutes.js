const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/coursesController");
const authController = require("../controllers/authController");

// Middleware de protection des routes
router.use(authController.ensureLoggedIn);

router.get("/", coursesController.index, coursesController.indexView);
router.get("/new", coursesController.new);
router.post("/create", coursesController.create, coursesController.redirectView);
router.get("/:id", coursesController.show, coursesController.showView);
router.get("/:id/edit", coursesController.edit);
router.put("/:id/update", coursesController.update, coursesController.redirectView);
router.delete("/:id/delete", coursesController.delete, coursesController.redirectView);

module.exports = router;