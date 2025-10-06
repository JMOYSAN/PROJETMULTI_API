const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const loggingMiddleware = require("../middleware/Logging.js");

router.use(loggingMiddleware);

// Routes spécifiques EN PREMIER
router.get('/group/:groupId/lazy', messagesController.lazyLoadMessages);
router.get("/group/:groupId", messagesController.groupMessages);

// Routes générales
router.get("/", messagesController.index);
router.post("/", messagesController.store);

// Routes avec :id EN DERNIER
router.get("/:id", messagesController.show);
router.delete("/:id", messagesController.destroy);

module.exports = router;