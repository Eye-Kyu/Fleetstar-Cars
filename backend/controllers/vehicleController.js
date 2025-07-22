const Vehicle = require('../models/Vehicle');
const fs = require('fs');
const path = require('path');

// @desc    Create a vehicle
exports.createVehicle = async (req, res) => {
    try {
        const {
            name,
            type,
            dailyRate,
            description,
            availabilityStatus,
            numberPlate,
            mileage,
            fuelType,
            seats,
            features
        } = req.body;

        // Convert features string to array if needed
        const featuresArray = typeof features === 'string' ?
            features.split(',').map(item => item.trim()) :
            features;

        const vehicle = new Vehicle({
            name,
            type,
            dailyRate: parseFloat(dailyRate),
            description,
            availabilityStatus: availabilityStatus === 'true',
            numberPlate,
            image: req.file ? req.file.path : undefined,
            mileage: mileage ? parseInt(mileage) : undefined,
            fuelType: fuelType || undefined,
            seats: seats ? parseInt(seats) : undefined,
            features: featuresArray
        });

        await vehicle.save();
        res.status(201).json(vehicle);
    } catch (err) {
        // Remove uploaded file if validation fails
        if (req.file) {
            fs.unlink(req.file.path, () => { });
        }
        res.status(400).json({
            message: err.message,
            errors: err.errors ? Object.fromEntries(
                Object.entries(err.errors).map(([key, { message }]) => [key, message])
            ) : undefined
        });
    }
};

// @desc    Get all vehicles with filtering
exports.getVehicles = async (req, res) => {
    try {
        const { type, available, minRate, maxRate, search } = req.query;

        const filter = {};

        if (type) filter.type = type;
        if (available) filter.availabilityStatus = available === 'true';
        if (minRate || maxRate) {
            filter.dailyRate = {};
            if (minRate) filter.dailyRate.$gte = parseFloat(minRate);
            if (maxRate) filter.dailyRate.$lte = parseFloat(maxRate);
        }
        if (search) {
            filter.$text = { $search: search };
        }

        const vehicles = await Vehicle.find(filter);
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
        const {
            name,
            type,
            dailyRate,
            description,
            availabilityStatus,
            numberPlate,
            mileage,
            fuelType,
            seats,
            features,
            removeImage
        } = req.body;

        // Get current vehicle first to handle image deletion
        const currentVehicle = await Vehicle.findById(req.params.id);
        if (!currentVehicle) {
            if (req.file) fs.unlink(req.file.path, () => { });
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Convert features string to array if needed
        const featuresArray = typeof features === 'string' ?
            features.split(',').map(item => item.trim()) :
            features;

        const updatedFields = {
            ...(name && { name }),
            ...(type && { type }),
            ...(dailyRate && { dailyRate: parseFloat(dailyRate) }),
            ...(description && { description }),
            ...(typeof availabilityStatus !== 'undefined' && {
                availabilityStatus: availabilityStatus === 'true'
            }),
            ...(numberPlate && { numberPlate }),
            ...(mileage && { mileage: parseInt(mileage) }),
            ...(fuelType && { fuelType }),
            ...(seats && { seats: parseInt(seats) }),
            ...(features && { features: featuresArray }),
        };

        // Handle image updates
        if (req.file) {
            // Delete old image if it exists
            if (currentVehicle.image && fs.existsSync(currentVehicle.image)) {
                fs.unlink(currentVehicle.image, () => { });
            }
            updatedFields.image = req.file.path;
        } else if (removeImage === 'true') {
            // Handle explicit image removal
            if (currentVehicle.image && fs.existsSync(currentVehicle.image)) {
                fs.unlink(currentVehicle.image, () => { });
            }
            updatedFields.image = undefined;
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        res.json(vehicle);
    } catch (err) {
        // Remove uploaded file if validation fails
        if (req.file) fs.unlink(req.file.path, () => { });
        res.status(400).json({
            message: err.message,
            errors: err.errors ? Object.fromEntries(
                Object.entries(err.errors).map(([key, { message }]) => [key, message])
            ) : undefined
        });
    }
};

// @desc    Delete vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Delete associated image file if it exists
        if (vehicle.image && fs.existsSync(vehicle.image)) {
            fs.unlink(vehicle.image, () => { });
        }

        await vehicle.deleteOne();
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};