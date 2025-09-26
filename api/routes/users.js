const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const loggingMiddleware = require("../middleware/Logging.js");
router.use(loggingMiddleware);

router.get("/", usersController.index);
router.get("/next/:id", usersController.nextUsers);
router.get("/:id", usersController.show);
router.post("/", usersController.store);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.destroy);
router.post("/login", usersController.login);
router.post("/register",usersController.register)

module.exports = router;
