const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getDashboardStats);
router.get('/recent-movements', dashboardController.getRecentMovements);

module.exports = router;
