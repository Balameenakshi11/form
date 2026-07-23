-- ============================================================
--  Yaazhlan Dance Studio — MySQL Database Script
--  Run this once in MySQL Workbench / mysql CLI to create the
--  database and the students table.
-- ============================================================

CREATE DATABASE IF NOT EXISTS yaazhlan_dance_studio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE yaazhlan_dance_studio;

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
  password           VARCHAR(255)  NOT NULL,      -- bcrypt hash, never plain text
  photo              VARCHAR(255)  NULL,           -- stored file path
  aadhaar            VARCHAR(255)  NULL,           -- stored file path
  medical_condition  VARCHAR(1000) NULL,
  emergency_notes    VARCHAR(1000) NULL,
  joining_date       DATE          NULL,
  created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_students_email    UNIQUE (email),
  CONSTRAINT uq_students_phone    UNIQUE (phone),
  CONSTRAINT uq_students_username UNIQUE (username)
) ENGINE=InnoDB;

-- Helpful lookup indexes
CREATE INDEX idx_students_course  ON students (course);
CREATE INDEX idx_students_created ON students (created_at);
