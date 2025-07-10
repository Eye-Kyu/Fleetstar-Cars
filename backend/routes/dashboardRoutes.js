const express = require('express');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get(
    '/',
    protect,
    authorizeRoles('admin', 'staff'),
    getDashboardStats
);

module.exports = router;
