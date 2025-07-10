const Vehicle = require('../models/Vehicle');

// @desc    Create a vehicle
exports.createVehicle = async (req, res) => {
    try {
        const { name, type, dailyRate, description, availabilityStatus, numberPlate } = req.body;

        const vehicle = new Vehicle({
            name,
            type,
            dailyRate,
            description,
            availabilityStatus,
            numberPlate,
            image: req.file ? req.file.path : null,
        });

        await vehicle.save();
        res.status(201).json(vehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get all vehicles
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get single vehicle
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json(vehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update vehicle
exports.updateVehicle = async (req, res) => {
    try {
        const { name, type, dailyRate, description, availabilityStatus, numberPlate } = req.body;

        const updatedFields = {
            ...(name && { name }),
            ...(type && { type }),
            ...(dailyRate && { dailyRate }),
            ...(description && { description }),
            ...(typeof availabilityStatus !== 'undefined' && { availabilityStatus }),
            ...(numberPlate && { numberPlate }),
        };

        if (req.file) {
            updatedFields.image = req.file.path;
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.json(vehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
