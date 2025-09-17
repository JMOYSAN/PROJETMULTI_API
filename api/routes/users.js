const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get("/", usersController.index);
router.post("/", usersController.store);
router.get("/:id", usersController.show);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.destroy);
router.get("/next/:id", usersController.nextUsers);

module.exports = router;
