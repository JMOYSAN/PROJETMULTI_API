const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const loggingMiddleware = require('../middleware/Logging.js');

router.use(loggingMiddleware);


router.get('/:term', searchController.search);

module.exports = router;
