const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");
const loggingMiddleware = require("../middleware/Logging.js");
const { validateBody, validateParams } = require("../validators/middleware");
const schemas = require("../validators/schemas");
const Joi = require("joi");

router.use(loggingMiddleware);

router.get("/public", groupsController.publicGroupsIndex);

router.get(
    "/private/:userId",
    validateParams(Joi.object({
        userId: Joi.number().integer().positive().required()
    })),
    groupsController.privateGroupsIndex
);

router.get(
    "/page/:offset",
    validateParams(Joi.object({
        offset: Joi.number().integer().min(0).required()
    })),
    groupsController.fetchNextGroups
);

router.get(
    "/:groupId/members",
    validateParams(Joi.object({
        groupId: Joi.number().integer().positive().required()
    })),
    groupsController.getGroupMembers
);

router.post(
    "/:groupId/users/:userId",
    validateParams(Joi.object({
        groupId: Joi.number().integer().positive().required(),
        userId: Joi.number().integer().positive().required()
    })),
    groupsController.addUserToGroup
);

router.post(
    "/",
    validateBody(schemas.group.create),
    groupsController.store
);

router.get(
    "/:id",
    validateParams(schemas.group.idParam),
    groupsController.show
);

router.put(
    "/:id",
    validateParams(schemas.group.idParam),
    validateBody(schemas.group.update),
    groupsController.update
);

router.delete(
    "/:id",
    validateParams(schemas.group.idParam),
    groupsController.destroy
);

module.exports = router;