const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const loggingMiddleware = require("../middleware/Logging,js");
router.use(loggingMiddleware);

router.get("/", usersController.index);
router.post("/", usersController.store);
router.get("/:id", usersController.show);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.destroy);
router.get("/next/:id", usersController.nextUsers);

module.exports = router;
