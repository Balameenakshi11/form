// ============================================================
//  controllers/studentController.js
//  Business logic for registration, login, and student CRUD.
//  Talks to models/studentModel.js — never touches SQL directly.
// ============================================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
require('dotenv').config();

const studentModel = require('../models/studentModel');

const SALT_ROUNDS = 12;

/**
 * Deletes any files multer already wrote to disk if we're about
 * to reject the request — keeps /uploads from filling up with
 * orphaned files from failed registrations.
 */
function cleanupUploadedFiles(files) {
  if (!files) return;
  Object.values(files).forEach((fileArray) => {
    fileArray.forEach((file) => {
      fs.unlink(file.path, () => {}); // best-effort, ignore errors
    });
  });
}

// ------------------------------------------------------------
//  POST /api/register
// ------------------------------------------------------------
async function registerStudent(req, res) {
  // express-validator results (see routes/studentRoutes.js for the rules)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    cleanupUploadedFiles(req.files);
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => e.msg)
    });
  }

  const {
    fullName, parentName, dob, age, gender, phone, whatsapp, email,
    address, city, state, pincode, course, batch, experience,
    joiningDate, username, password, confirmPassword,
    medicalConditions, emergencyContact, emergencyNotes
  } = req.body;

  if (password !== confirmPassword) {
    cleanupUploadedFiles(req.files);
    return res.status(400).json({
      success: false,
      message: 'Password and Confirm Password do not match.'
    });
  }

  try {
    // Duplicate email / phone / username check
    const existing = await studentModel.findByEmailPhoneOrUsername(email, phone, username);
    if (existing) {
      cleanupUploadedFiles(req.files);
      let message = 'This account already exists.';
      if (existing.email === email) message = 'This email is already registered.';
      else if (existing.phone === phone) message = 'This phone number is already registered.';
      else if (existing.username === username) message = 'This username is already taken.';
      return res.status(409).json({ success: false, message });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Combine the emergency contact number + notes into a single
    // column, since the students table only has "emergency_notes".
    let combinedEmergencyNotes = emergencyNotes || null;
    if (emergencyContact) {
      combinedEmergencyNotes = `Emergency contact: ${emergencyContact}.${emergencyNotes ? ' ' + emergencyNotes : ''}`;
    }

    const photoFile = req.files?.photo?.[0];
    const aadhaarFile = req.files?.aadhaar?.[0];

    if (!photoFile) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ success: false, message: 'Student photo is required.' });
    }

    const newId = await studentModel.createStudent({
      full_name: fullName,
      parent_name: parentName || null,
      dob: dob || null,
      age: age ? Number(age) : null,
      gender: gender || null,
      phone,
      whatsapp,
      email,
      address: address || null,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      course,
      batch: batch || null,
      experience: experience || null,
      username,
      password: hashedPassword,
      photo: `/uploads/${photoFile.filename}`,
      aadhaar: aadhaarFile ? `/uploads/${aadhaarFile.filename}` : null,
      medical_condition: medicalConditions || null,
      emergency_notes: combinedEmergencyNotes,
      joining_date: joiningDate || null
    });

    return res.status(201).json({
      success: true,
      message: '✅ Registration Successful',
      studentId: newId
    });
  } catch (err) {
    console.error('Register error:', err);
    cleanupUploadedFiles(req.files);

    // MySQL duplicate-key race condition safety net
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Email, phone, or username is already registered.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while registering. Please try again.'
    });
  }
}

// ------------------------------------------------------------
//  POST /api/login
// ------------------------------------------------------------
async function loginStudent(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => e.msg)
    });
  }

  const { identifier, password } = req.body; // identifier = username or email

  try {
    const student = await studentModel.findByUsernameOrEmail(identifier);
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password.' });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password.' });
    }

    const token = jwt.sign(
      { studentId: student.student_id, username: student.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      student: {
        studentId: student.student_id,
        fullName: student.full_name,
        username: student.username,
        email: student.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}

// ------------------------------------------------------------
//  GET /api/students
// ------------------------------------------------------------
async function getAllStudents(req, res) {
  try {
    const students = await studentModel.getAllStudents();
    return res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    console.error('Get all students error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
}

// ------------------------------------------------------------
//  GET /api/students/:id
// ------------------------------------------------------------
async function getStudentById(req, res) {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    return res.status(200).json({ success: true, data: student });
  } catch (err) {
    console.error('Get student by id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student.' });
  }
}

// ------------------------------------------------------------
//  PUT /api/students/:id
// ------------------------------------------------------------
async function updateStudent(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => e.msg)
    });
  }

  try {
    const existing = await studentModel.getStudentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const {
      fullName, parentName, dob, age, gender, phone, whatsapp, email,
      address, city, state, pincode, course, batch, experience,
      joiningDate, medicalConditions, emergencyNotes
    } = req.body;

    const affectedRows = await studentModel.updateStudent(req.params.id, {
      full_name: fullName ?? existing.full_name,
      parent_name: parentName ?? existing.parent_name,
      dob: dob ?? existing.dob,
      age: age !== undefined ? Number(age) : existing.age,
      gender: gender ?? existing.gender,
      phone: phone ?? existing.phone,
      whatsapp: whatsapp ?? existing.whatsapp,
      email: email ?? existing.email,
      address: address ?? existing.address,
      city: city ?? existing.city,
      state: state ?? existing.state,
      pincode: pincode ?? existing.pincode,
      course: course ?? existing.course,
      batch: batch ?? existing.batch,
      experience: experience ?? existing.experience,
      medical_condition: medicalConditions ?? existing.medical_condition,
      emergency_notes: emergencyNotes ?? existing.emergency_notes,
      joining_date: joiningDate ?? existing.joining_date
    });

    if (affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'No changes were made.' });
    }

    return res.status(200).json({ success: true, message: 'Student updated successfully.' });
  } catch (err) {
    console.error('Update student error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email or phone already in use by another student.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
}

// ------------------------------------------------------------
//  DELETE /api/students/:id
// ------------------------------------------------------------
async function deleteStudent(req, res) {
  try {
    const existing = await studentModel.getStudentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await studentModel.deleteStudent(req.params.id);

    // Clean up the student's uploaded files from disk too
    [existing.photo, existing.aadhaar].forEach((filePath) => {
      if (filePath) {
        const absolute = path.join(__dirname, '..', filePath.replace(/^\/uploads\//, 'uploads/'));
        fs.unlink(absolute, () => {});
      }
    });

    return res.status(200).json({ success: true, message: 'Student deleted successfully.' });
  } catch (err) {
    console.error('Delete student error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
}

module.exports = {
  registerStudent,
  loginStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
