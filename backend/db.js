// ============================================================
//  db.js
//  Thin re-export of the MySQL pool from config/database.js so
//  other files can simply `require('../db')`.
// ============================================================

const pool = require('./config/database');

module.exports = pool;
