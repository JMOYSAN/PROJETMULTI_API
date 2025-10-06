const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");
const loggingMiddleware = require("../middleware/Logging.js");
router.use(loggingMiddleware);

router.get("/", groupsController.index);

router.get("/private/:userId", groupsController.privateGroupsIndex);

router.get("/public", groupsController.publicGroupsIndex);

router.get("/next/:type/:lastId", groupsController.nextGroups);


router.get("/:id", groupsController.show);
router.post("/", groupsController.store);
router.put("/:id", groupsController.update);
router.delete("/:id", groupsController.destroy);

module.exports = router;
