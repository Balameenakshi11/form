// ============================================================
//  middleware/upload.js
//  Multer configuration for student photo + Aadhaar uploads.
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // e.g. photo-1721234567890-483920.jpg
    const safeField = file.fieldname.replace(/[^a-zA-Z0-9]/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${safeField}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only .jpg, .jpeg, .png and .pdf files are allowed.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB per file
});

// Registration form sends two files: "photo" (required) and "aadhaar" (optional)
const uploadStudentFiles = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 }
]);

module.exports = { upload, uploadStudentFiles };
