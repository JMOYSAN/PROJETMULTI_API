const express = require("express");
const router = express.Router();
const apiController = require("../controllers/ApiController");
const loggingMiddleware = require("../middleware/Logging,js");
router.use(loggingMiddleware);
router
  .route("/")
  .get(apiController.index)
  .post(apiController.store)
  .put(apiController.update);

module.exports = router;
