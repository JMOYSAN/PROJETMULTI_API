const express = require("express");
const router = express.Router();
const groupUsersController = require("../controllers/groupUsersController");

router.post("/", groupUsersController.store);
router.delete("/", groupUsersController.destroy);

module.exports = router;
