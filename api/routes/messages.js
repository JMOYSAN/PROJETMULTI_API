const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

router.get("/", messagesController.index);
router.post("/", messagesController.store);
router.get("/:id", messagesController.show);
router.delete("/:id", messagesController.destroy);

module.exports = router;
