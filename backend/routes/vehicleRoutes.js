const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
    createVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} = require('../controllers/vehicleController');

// Public - view all vehicles
router.get('/', getVehicles);

// Public - view single vehicle
router.get('/:id', getVehicleById);

// Admin/Staff - create
router.post(
    '/',
    protect,
    authorizeRoles('admin', 'staff'),
    upload.single('image'),
    createVehicle
);

// Admin/Staff - update
router.put(
    '/:id',
    protect,
    authorizeRoles('admin', 'staff'),
    upload.single('image'),
    updateVehicle
);

// Admin/Staff - delete
router.delete(
    '/:id',
    protect,
    authorizeRoles('admin', 'staff'),
    deleteVehicle
);

module.exports = router;
