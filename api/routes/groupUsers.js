const express = require("express");
const router = express.Router();
const groupUsersController = require("../controllers/groupUsersController");
const loggingMiddleware = require("../middleware/Logging.js");
const usersController = require("../controllers/usersController");
router.use(loggingMiddleware);

router.post("/", groupUsersController.store);
router.delete("/", groupUsersController.destroy);
router.get("/", groupUsersController.index);
router.get("/:id", groupUsersController.show);

module.exports = router;
