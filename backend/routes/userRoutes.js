const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/userController');

const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// 🔐 all routes here require authentication + admin access
router.use(protect, authorizeRoles('admin'));

// GET /api/users — list all users
router.get('/', getAllUsers);

// GET /api/users/:id — get single user
router.get('/:id', getUserById);

// PUT /api/users/:id — update user
router.put('/:id', updateUser);

// DELETE /api/users/:id — delete user
router.delete('/:id', deleteUser);

module.exports = router;
