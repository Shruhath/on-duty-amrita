-- Complete Database Structure for OD Manager
-- This documents the final Firestore collections structure

-- STUDENTS Collection
-- Document ID: rollNumber (e.g., "CB.SC.U4CSE24124")
-- Auto-parsed fields from roll number format
CREATE TABLE students_final_structure (
    rollNumber VARCHAR(20) PRIMARY KEY,     -- CB.SC.U4CSE24124
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,            -- cb.sc.u4cse24124@cb.students.amrita.edu
    campus VARCHAR(10) NOT NULL,            -- CB (Coimbatore)
    school VARCHAR(10) NOT NULL,            -- SC (School of Computing)
    programme VARCHAR(10) NOT NULL,         -- U4 (Undergrad 4-year)
    department VARCHAR(10) NOT NULL,        -- CSE (Computer Science)
    year INTEGER NOT NULL,                  -- 2024 (from 24)
    section VARCHAR(1) NOT NULL,            -- B (from digit 1)
    classRollNumber INTEGER NOT NULL,       -- 24 (last 2 digits)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STUDENT COORDINATORS Collection
-- Document ID: auto-generated
-- Updated with name field and auto-calculated email
CREATE TABLE studentcoordinator_final_structure (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,             -- Added name field
    rollNumber VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,            -- Auto-calculated from roll number
    eventName VARCHAR(50) NOT NULL,         -- Procession, Campus Decoration, Float, Culturals
    assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SCAN LOGS Collection
-- Document ID: auto-generated timestamp
-- For NFC scan tracking
CREATE TABLE scan_logs_structure (
    id VARCHAR(50) PRIMARY KEY,
    rollNumber VARCHAR(20) NOT NULL,
    studentName VARCHAR(100) NOT NULL,
    slot INTEGER NOT NULL,                  -- 1-12
    date DATE NOT NULL,
    scannedAt TIMESTAMP NOT NULL,
    coordinatorId VARCHAR(50) NOT NULL,
    coordinatorName VARCHAR(100) NOT NULL,
    eventName VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    deviceInfo TEXT
);

-- OD ENTRIES Collection
-- Document ID: rollNumber
-- Contains dynamic timestamp keys for each OD entry
CREATE TABLE od_entries_final_structure (
    rollNumber VARCHAR(20) PRIMARY KEY,
    -- Dynamic fields: timestamp_key -> {date: "2024-01-15", slot: 3}
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USERS Collection
-- Document ID: Firebase Auth UID
-- For authentication and role management
CREATE TABLE users_final_structure (
    uid VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,              -- admin, teacher, student, coordinator
    rollNumber VARCHAR(20),                 -- Only for students/coordinators
    department VARCHAR(10),                 -- For teachers
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roll Number Parsing Logic Documentation
-- Format: CB.SC.U4CSE24124
-- CB = Campus (Coimbatore)
-- SC = School (School of Computing)  
-- U4 = Programme (Undergrad 4-year)
-- CSE = Department (Computer Science and Engineering)
-- 24 = Year (2024)
-- 1 = Section (B - where 0=A, 1=B, 2=C, etc.)
-- 24 = Class roll number

-- Email Generation Logic
-- Roll number: CB.SC.U4CSE24124
-- Email: cb.sc.u4cse24124@cb.students.amrita.edu
-- (lowercase roll number + @cb.students.amrita.edu)

-- Gokulashtami Events
-- 1. Procession
-- 2. Campus Decoration  
-- 3. Float
-- 4. Culturals

-- Note: This is documentation of the Firestore structure
-- Actual collections are created through the application
