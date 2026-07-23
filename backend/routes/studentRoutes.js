// ============================================================
//  routes/studentRoutes.js
//  Defines every /api/... endpoint and wires up:
//    validation (express-validator) -> upload (multer) ->
//    auth (JWT, where required) -> controller
// ============================================================

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { uploadStudentFiles } = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');

// ------------------------------------------------------------
//  Validation rule sets
// ------------------------------------------------------------
const registerValidationRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit phone number.'),
  body('whatsapp')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit WhatsApp number.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('course').trim().notEmpty().withMessage('Please select a course.'),
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword').notEmpty().withMessage('Please confirm your password.')
];

const loginValidationRules = [
  body('identifier').trim().notEmpty().withMessage('Username or email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

const updateValidationRules = [
  param('id').isInt().withMessage('Invalid student ID.'),
  body('email').optional().isEmail().withMessage('Enter a valid email address.'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit phone number.')
];

const idValidationRule = [param('id').isInt().withMessage('Invalid student ID.')];

// ------------------------------------------------------------
//  Public routes
// ------------------------------------------------------------

// POST /api/register  (multipart/form-data: photo, aadhaar + text fields)
router.post(
  '/register',
  uploadStudentFiles,
  registerValidationRules,
  studentController.registerStudent
);

// POST /api/login  (JSON: { identifier, password })
router.post('/login', loginValidationRules, studentController.loginStudent);

// ------------------------------------------------------------
//  Protected routes — require a valid JWT (Authorization: Bearer <token>)
// ------------------------------------------------------------

// GET /api/students
router.get('/students', verifyToken, studentController.getAllStudents);

// GET /api/students/:id
router.get('/students/:id', verifyToken, idValidationRule, studentController.getStudentById);

// PUT /api/students/:id
router.put('/students/:id', verifyToken, updateValidationRules, studentController.updateStudent);

// DELETE /api/students/:id
router.delete('/students/:id', verifyToken, idValidationRule, studentController.deleteStudent);

module.exports = router;
