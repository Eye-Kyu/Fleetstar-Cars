const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createError = require('http-errors');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExt = path.extname(file.originalname).toLowerCase();
        cb(null, 'vehicle-' + uniqueSuffix + fileExt);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(createError(400, 'Only .jpeg, .jpg, .png, or .webp images are allowed'), false);
    }
};

const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow single file upload
};

const upload = multer({
    storage,
    fileFilter,
    limits
}).single('image'); // Explicitly handle single file uploads for 'image' field

// Middleware wrapper for better error handling
const handleUpload = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(createError(400, 'File size too large. Maximum 5MB allowed'));
            }
            return next(err);
        }
        next();
    });
};

module.exports = handleUpload;