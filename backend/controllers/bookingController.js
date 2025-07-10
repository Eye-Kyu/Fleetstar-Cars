const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// Create Booking
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

        // ✅ Check for overlapping bookings BEFORE creating
        const overlapping = await Booking.findOne({
            vehicle: vehicleId,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    pickupDate: { $lte: end },
                    returnDate: { $gte: start }
                }
            ]
        }).lean();

        if (overlapping) {
            return res.status(400).json({ message: 'Vehicle already booked for this period' });
        }

        const totalCost = days * vehicle.dailyRate;

        const booking = await Booking.create({
            customer: req.user._id,
            vehicle: vehicleId,
            pickupDate: start,
            returnDate: end,
            pickupLocation,
            totalCost
        });

        res.status(201).json(booking);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get All Bookings (Admin/Staff) — with pagination & sorting
exports.getAllBookings = async (req, res) => {
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
};

// Get My Bookings (Customer)
exports.getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ customer: req.user._id })
        .populate('vehicle', 'name type numberPlate');
    res.json(bookings);
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (
            req.user.role === 'customer' &&
            booking.customer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled', booking });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Mark Booking as Completed (Admin/Staff)
exports.completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'completed';
        await booking.save();

        res.json({ message: 'Booking marked as completed', booking });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
