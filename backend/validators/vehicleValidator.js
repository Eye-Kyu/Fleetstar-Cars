// validators/vehicleValidator.js
const { check } = require('express-validator');
const Vehicle = require('../models/Vehicle');

exports.validateVehicle = [
    check('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),

    check('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['Sedan', 'SUV', 'Truck', 'Van', 'Luxury', 'Electric', 'Hatchback', 'Sports'])
        .withMessage('Invalid vehicle type'),

    check('dailyRate')
        .notEmpty().withMessage('Daily rate is required')
        .isFloat({ min: 0 }).withMessage('Daily rate must be positive'),

    check('numberPlate')
        .notEmpty().withMessage('License plate is required')
        .custom(async (value, { req }) => {
            const vehicle = await Vehicle.findOne({ numberPlate: value });
            if (vehicle && vehicle._id.toString() !== req.params?.id) {
                throw new Error('License plate already in use');
            }
            return true;
        }),

    check('mileage')
        .optional()
        .isInt({ min: 0 }).withMessage('Mileage must be positive'),

    check('seats')
        .optional()
        .isInt({ min: 1, max: 20 }).withMessage('Seats must be between 1-20'),

    check('features')
        .optional()
        .isArray().withMessage('Features must be an array')
];