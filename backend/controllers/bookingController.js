const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// Create Booking (now defaults to 'pending' status)
exports.createBooking = async (req, res) => {
    try {
        const { vehicleId, pickupDate, returnDate, pickupLocation } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || !vehicle.availabilityStatus) {
            return res.status(400).json({ message: 'Vehicle not available' });
        }

        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            return res.status(400).json({ message: 'Invalid booking dates' });
        }

        // Check for overlapping bookings
        const overlapping = await Booking.findOne({
            vehicle: vehicleId,
            status: { $nin: ['cancelled', 'rejected'] }, // Exclude cancelled/rejected
            $or: [
                { pickupDate: { $lte: end }, returnDate: { $gte: start } }
            ]
        });

        if (overlapping) {
            return res.status(400).json({
                message: 'Vehicle already booked for these dates'
            });
        }

        const totalCost = days * vehicle.dailyRate;

        const booking = await Booking.create({
            customer: req.user._id,
            vehicle: vehicleId,
            pickupDate: start,
            returnDate: end,
            pickupLocation,
            totalCost,
            status: 'pending' // New bookings require approval
        });

        res.status(201).json(booking);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get All Bookings (Admin/Staff)
exports.getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;

        const bookings = await Booking.find()
            .sort({ [sortBy]: order })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('customer', 'name email')
            .populate('vehicle', 'name type numberPlate');

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Pending Bookings (Admin)
exports.getPendingBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'pending' })
            .populate('customer', 'name email phone')
            .populate('vehicle', 'name dailyRate image numberPlate')
            .sort({ createdAt: 1 }); // Oldest first

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Approve/Reject Booking (Admin)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findById(id)
            .populate('vehicle', 'availabilityStatus');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                message: `Booking already ${booking.status}`
            });
        }

        // Update booking
        booking.status = status;
        booking.adminNotes = adminNotes || '';
        await booking.save();

        // Update vehicle availability if approved
        if (status === 'approved') {
            await Vehicle.findByIdAndUpdate(
                booking.vehicle._id,
                { availabilityStatus: false }
            );
        }

        res.json({
            message: `Booking ${status} successfully`,
            booking
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get My Bookings (Customer)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.user._id })
            .populate('vehicle', 'name type image numberPlate')
            .sort({ createdAt: -1 }); // Newest first

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cancel Booking (Updated with status checks)
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle', 'availabilityStatus');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Authorization check
        if (req.user.role === 'customer' &&
            booking.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Status validation
        if (!['pending', 'approved'].includes(booking.status)) {
            return res.status(400).json({
                message: `Cannot cancel a ${booking.status} booking`
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Free up vehicle if it was approved
        if (booking.status === 'approved') {
            await Vehicle.findByIdAndUpdate(
                booking.vehicle._id,
                { availabilityStatus: true }
            );
        }

        res.json({
            message: 'Booking cancelled',
            booking
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Complete Booking (Admin/Staff - Enhanced)
exports.completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle', 'availabilityStatus');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'approved') {
            return res.status(400).json({
                message: 'Only approved bookings can be completed'
            });
        }

        booking.status = 'completed';
        await booking.save();

        // Make vehicle available again
        await Vehicle.findByIdAndUpdate(
            booking.vehicle._id,
            { availabilityStatus: true }
        );

        res.json({
            message: 'Booking marked as completed',
            booking
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};