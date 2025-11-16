const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const loggingMiddleware = require('../middleware/Logging.js');
const { validateParams } = require('../validators/middleware');
const schemas = require('../validators/schemas');

router.use(loggingMiddleware);

router.get(
    '/:term',
    validateParams(schemas.search.termParam),
    searchController.search
);

module.exports = router;