// ============================================================
//  models/studentModel.js
//  All direct database access lives here. Every query uses
//  parameterised placeholders (?) — mysql2 turns these into
//  prepared statements, which is what prevents SQL injection.
// ============================================================

const pool = require('../db');

/**
 * Find a student by email OR phone OR username — used for the
 * duplicate check during registration.
 */
async function findByEmailPhoneOrUsername(email, phone, username) {
  const [rows] = await pool.execute(
    `SELECT student_id, email, phone, username
     FROM students
     WHERE email = ? OR phone = ? OR username = ?
     LIMIT 1`,
    [email, phone, username]
  );
  return rows[0] || null;
}

/**
 * Find a student by username OR email — used for login.
 */
async function findByUsernameOrEmail(identifier) {
  const [rows] = await pool.execute(
    `SELECT student_id, full_name, username, email, password
     FROM students
     WHERE username = ? OR email = ?
     LIMIT 1`,
    [identifier, identifier]
  );
  return rows[0] || null;
}

/**
 * Insert a new student record. Returns the inserted student_id.
 */
async function createStudent(data) {
  const [result] = await pool.execute(
    `INSERT INTO students (
        full_name, parent_name, dob, age, gender, phone, whatsapp, email,
        address, city, state, pincode, course, batch, experience,
        username, password, photo, aadhaar,
        medical_condition, emergency_notes, joining_date
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.full_name,
      data.parent_name,
      data.dob,
      data.age,
      data.gender,
      data.phone,
      data.whatsapp,
      data.email,
      data.address,
      data.city,
      data.state,
      data.pincode,
      data.course,
      data.batch,
      data.experience,
      data.username,
      data.password, // already bcrypt-hashed by the controller
      data.photo,
      data.aadhaar,
      data.medical_condition,
      data.emergency_notes,
      data.joining_date
    ]
  );
  return result.insertId;
}

/**
 * Fetch every student, most recent first. Password is never selected.
 */
async function getAllStudents() {
  const [rows] = await pool.execute(
    `SELECT student_id, full_name, parent_name, dob, age, gender, phone,
            whatsapp, email, address, city, state, pincode, course, batch,
            experience, username, photo, aadhaar, medical_condition,
            emergency_notes, joining_date, created_at
     FROM students
     ORDER BY created_at DESC`
  );
  return rows;
}

/**
 * Fetch a single student by ID. Password is never selected.
 */
async function getStudentById(id) {
  const [rows] = await pool.execute(
    `SELECT student_id, full_name, parent_name, dob, age, gender, phone,
            whatsapp, email, address, city, state, pincode, course, batch,
            experience, username, photo, aadhaar, medical_condition,
            emergency_notes, joining_date, created_at
     FROM students
     WHERE student_id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Update an existing student's editable fields.
 */
async function updateStudent(id, data) {
  const [result] = await pool.execute(
    `UPDATE students SET
        full_name = ?, parent_name = ?, dob = ?, age = ?, gender = ?,
        phone = ?, whatsapp = ?, email = ?, address = ?, city = ?,
        state = ?, pincode = ?, course = ?, batch = ?, experience = ?,
        medical_condition = ?, emergency_notes = ?, joining_date = ?
     WHERE student_id = ?`,
    [
      data.full_name,
      data.parent_name,
      data.dob,
      data.age,
      data.gender,
      data.phone,
      data.whatsapp,
      data.email,
      data.address,
      data.city,
      data.state,
      data.pincode,
      data.course,
      data.batch,
      data.experience,
      data.medical_condition,
      data.emergency_notes,
      data.joining_date,
      id
    ]
  );
  return result.affectedRows;
}

/**
 * Delete a student by ID. Returns number of affected rows (0 or 1).
 */
async function deleteStudent(id) {
  const [result] = await pool.execute(
    `DELETE FROM students WHERE student_id = ?`,
    [id]
  );
  return result.affectedRows;
}

module.exports = {
  findByEmailPhoneOrUsername,
  findByUsernameOrEmail,
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
