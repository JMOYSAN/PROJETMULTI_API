const express = require("express");
const router = express.Router();
const groupUsersController = require("../controllers/groupUsersController");
const loggingMiddleware = require("../middleware/Logging.js");
const { validateBody, validateParams } = require("../validators/middleware");
const schemas = require("../validators/schemas");
const Joi = require("joi");

router.use(loggingMiddleware);

router.post(
    "/",
    validateBody(schemas.groupUser.create),
    groupUsersController.store
);

router.delete(
    "/",
    validateBody(schemas.groupUser.delete),
    groupUsersController.destroy
);

router.get("/", groupUsersController.index);

router.get(
    "/group/:groupId",
    validateParams(Joi.object({
        groupId: Joi.number().integer().positive().required()
    })),
    groupUsersController.groupMembers
);

router.get(
    "/:id",
    validateParams(Joi.object({
        id: Joi.number().integer().positive().required()
    })),
    groupUsersController.show
);

module.exports = router;