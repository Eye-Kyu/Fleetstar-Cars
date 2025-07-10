const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {
        // Total Bookings
        const totalBookings = await Booking.countDocuments();

        // Total Revenue (only paid bookings)
        const totalRevenueData = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, revenue: { $sum: "$totalCost" } } }
        ]);
        const totalRevenue = totalRevenueData[0]?.revenue || 0;

        // Active Vehicles
        const activeVehicles = await Vehicle.countDocuments({ availabilityStatus: true });

        // User & Staff Counts
        const customers = await User.countDocuments({ role: 'customer' });
        const staff = await User.countDocuments({ role: { $in: ['staff', 'admin'] } });

        // Bookings by Vehicle Type
        const bookingsByType = await Booking.aggregate([
            {
                $lookup: {
                    from: "vehicles",
                    localField: "vehicle",
                    foreignField: "_id",
                    as: "vehicleDetails"
                }
            },
            { $unwind: "$vehicleDetails" },
            {
                $group: {
                    _id: "$vehicleDetails.type",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Bookings over time (optional - monthly)
        const bookingsOverTime = await Booking.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            totalBookings,
            totalRevenue,
            activeVehicles,
            customers,
            staff,
            bookingsByType,
            bookingsOverTime
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
