const express = require('express');
const {
    createBooking,
    getAllBookings,
    getMyBookings,
    cancelBooking,
    completeBooking,
    updateBookingStatus  // NEW CONTROLLER
} = require('../controllers/bookingController');

const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Customer - create booking
router.post('/', protect, createBooking);

// Customer - view my bookings
router.get('/my', protect, getMyBookings);

// Customer/Admin/Staff - cancel booking
router.put('/:id/cancel', protect, cancelBooking);

// Admin/Staff - mark as completed
router.put(
    '/:id/complete',
    protect,
    authorizeRoles('admin', 'staff'),
    completeBooking
);

// NEW: Admin/Staff - update booking status (approve/reject/etc)
router.put(
    '/:id/status',
    protect,
    authorizeRoles('admin', 'staff'),
    updateBookingStatus
);

// Admin/Staff - view all bookings (with pagination & sorting)
router.get(
    '/',
    protect,
    authorizeRoles('admin', 'staff'),
    getAllBookings
);

module.exports = router;