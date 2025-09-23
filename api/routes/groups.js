const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");
const loggingMiddleware = require("../middleware/Logging.js");

router.use(loggingMiddleware);

router.get("/", groupsController.index);
router.get("/user/:userId", groupsController.userGroupsIndex);
router.get("/public/:userId", groupsController.publicGroupsIndex);
router.get("/:id", groupsController.show);
router.post("/", groupsController.store);
router.put("/:id", groupsController.update);
router.delete("/:id", groupsController.destroy);

router.get("/lazy/user/:userId", groupsController.userGroupsLazy);
router.get("/lazy/public/:userId", groupsController.publicGroupsLazy);

module.exports = router;
