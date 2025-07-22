const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const vehicleController = require('../controllers/vehicleController');

// Public routes
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Protected admin/staff routes
router.use(protect, authorizeRoles('admin', 'staff'));

// Create vehicle with image upload
router.post('/', upload, vehicleController.createVehicle);

// Update vehicle with potential image upload
router.put('/:id', upload, vehicleController.updateVehicle);

// Delete vehicle
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;