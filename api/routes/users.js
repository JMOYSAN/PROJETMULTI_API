const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const loggingMiddleware = require("../middleware/Logging.js");
const { validateBody, validateParams } = require("../validators/middleware");
const schemas = require("../validators/schemas");

router.use(loggingMiddleware);

router.get("/", usersController.index);

router.get(
    "/next/:id",
    validateParams(schemas.user.idParam),
    usersController.nextUsers
);

router.get(
    "/:id",
    validateParams(schemas.user.idParam),
    usersController.show
);

router.post(
    "/",
    validateBody(schemas.user.create),
    usersController.store
);

router.put(
    "/:id",
    validateParams(schemas.user.idParam),
    validateBody(schemas.user.update),
    usersController.update
);

router.delete(
    "/:id",
    validateParams(schemas.user.idParam),
    usersController.destroy
);

module.exports = router;