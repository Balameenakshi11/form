// ============================================================
//  config/database.js
//  Creates and exports a MySQL connection pool (mysql2/promise)
//  using credentials from the .env file.
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQLPRIVATEURL;

let pool;

if (connectionString) {
  pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
  });
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'yaazhlan_dance_studio',
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
  });
}

// Quick sanity check on startup so connection errors surface immediately
// instead of silently failing on the first request.
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();
  } catch (err) {
    console.error('❌ Failed to connect to MySQL database:', err.message);
  }
})();

module.exports = pool;
