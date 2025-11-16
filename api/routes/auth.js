const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateBody } = require("../validators/middleware");
const schemas = require("../validators/schemas");

router.post("/register", validateBody(schemas.auth.register), authController.register);
router.post("/login", validateBody(schemas.auth.login), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;
