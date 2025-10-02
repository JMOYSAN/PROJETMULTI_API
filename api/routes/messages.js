const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const loggingMiddleware = require("../middleware/Logging.js");
router.use(loggingMiddleware);

router.get("/", messagesController.index);
router.post("/", messagesController.store);
router.get("/:id", messagesController.show);
router.delete("/:id", messagesController.destroy);
router.get("/group/:groupId", messagesController.groupMessages);
module.exports = router;
