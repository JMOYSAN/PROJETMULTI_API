const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const loggingMiddleware = require("../middleware/Logging.js");
const { validateBody, validateParams, validateQuery } = require("../validators/middleware");
const schemas = require("../validators/schemas");

router.use(loggingMiddleware);

router.get(
    '/group/:groupId/lazy',
    validateParams(schemas.group.idParam.keys({ groupId: schemas.group.idParam.extract('id') })),
    validateQuery(schemas.message.lazyLoadQuery),
    messagesController.lazyLoadMessages
);

router.get(
    "/group/:groupId",
    validateParams(schemas.group.idParam.keys({ groupId: schemas.group.idParam.extract('id') })),
    messagesController.groupMessages
);

router.get(
    "/",
    validateQuery(schemas.message.query),
    messagesController.index
);

router.post(
    "/",
    validateBody(schemas.message.create),
    messagesController.store
);

router.get(
    "/:id",
    validateParams(schemas.group.idParam),
    messagesController.show
);

router.delete(
    "/:id",
    validateParams(schemas.group.idParam),
    messagesController.destroy
);

module.exports = router;