const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");
const loggingMiddleware = require("../middleware/Logging,js");
router.use(loggingMiddleware);

router.get("/", groupsController.index);
router.post("/", groupsController.store);
router.get("/:id", groupsController.show);
router.put("/:id", groupsController.update);
router.delete("/:id", groupsController.destroy);

module.exports = router;
