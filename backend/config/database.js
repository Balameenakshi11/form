// ============================================================
//  config/database.js
//  Creates and exports a MySQL connection pool (mysql2/promise)
//  using credentials from the .env file.
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.MYSQLPRIVATEURL ||
  process.env.MYSQL_PRIVATE_URL ||
  process.env.MYSQL_PUBLIC_URL ||
  process.env.MYSQLPUBLICURL;

let pool;

if (connectionString) {
  console.log('🔗 Connecting to MySQL using connection URL...');
  pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
  });
} else {
  const host = process.env.MYSQLHOST || process.env.MYSQLPRIVATEHOST || process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
  const user = process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '';
  const database = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || 'yaazhlan_dance_studio';
  const port = Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || 3306);

  if (host === 'localhost' && (process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT || process.env.PORT)) {
    console.warn('⚠️ Warning: Running on Railway but MYSQLHOST / DATABASE_URL is not set in Railway service variables.');
  }

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
  });
}

// Ensure database table exists on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');

    // Auto-create students table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        student_id        INT AUTO_INCREMENT PRIMARY KEY,
        full_name          VARCHAR(150)  NOT NULL,
        parent_name        VARCHAR(150)  NULL,
        dob                DATE          NULL,
        age                INT           NULL,
        gender             VARCHAR(10)   NULL,
        phone              VARCHAR(15)   NOT NULL,
        whatsapp           VARCHAR(15)   NOT NULL,
        email              VARCHAR(150)  NOT NULL,
        address            VARCHAR(500)  NULL,
        city               VARCHAR(100)  NULL,
        state              VARCHAR(100)  NULL,
        pincode            VARCHAR(10)   NULL,
        course             VARCHAR(100)  NOT NULL,
        batch              VARCHAR(20)   NULL,
        experience         VARCHAR(20)   NULL,
        username           VARCHAR(60)   NOT NULL,
        password           VARCHAR(255)  NOT NULL,
        photo              VARCHAR(255)  NULL,
        aadhaar            VARCHAR(255)  NULL,
        medical_condition  VARCHAR(1000) NULL,
        emergency_notes    VARCHAR(1000) NULL,
        joining_date       DATE          NULL,
        created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT uq_students_email    UNIQUE (email),
        CONSTRAINT uq_students_phone    UNIQUE (phone),
        CONSTRAINT uq_students_username UNIQUE (username)
      ) ENGINE=InnoDB;
    `);
    console.log('✅ Verified/Created students table schema.');
    connection.release();
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
})();

module.exports = pool;
