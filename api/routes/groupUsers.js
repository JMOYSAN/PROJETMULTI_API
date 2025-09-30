const express = require("express");
const router = express.Router();
const groupUsersController = require("../controllers/groupUsersController");
const loggingMiddleware = require("../middleware/Logging.js");
router.use(loggingMiddleware);

router.post("/", groupUsersController.store);
router.delete("/", groupUsersController.destroy);
router.get("/", groupUsersController.index);

module.exports = router;
