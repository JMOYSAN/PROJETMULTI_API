const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");
const loggingMiddleware = require("../middleware/Logging.js");
router.use(loggingMiddleware);

router.get("/public", groupsController.publicGroupsIndex)
router.get("/private/:userId", groupsController.privateGroupsIndex)
router.get("/page/:offset", groupsController.fetchNextGroups)

router.get("/:groupId/members", groupsController.getGroupMembers)
router.post("/:groupId/users/:userId", groupsController.addUserToGroup)
router.get("/next/:type/:lastId", groupsController.nextGroups);
router.post("/", groupsController.store)
router.get("/:id", groupsController.show)
router.put("/:id", groupsController.update)
router.delete("/:id", groupsController.destroy)

module.exports = router;
