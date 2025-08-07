-- Firestore Collections Structure Documentation
-- 
-- This file documents the structure of Firestore collections
-- used in the OD Manager application

-- STUDENTS Collection
-- Document ID: rollNumber (e.g., "CB.SC.U4CSE24124")
CREATE TABLE students_structure (
    rollNumber VARCHAR(20) PRIMARY KEY,  -- CB.SC.U4CSE24124
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,         -- cb.sc.u4cse24124@cb.students.amrita.edu
    campus VARCHAR(10) NOT NULL,         -- CB (Coimbatore)
    school VARCHAR(10) NOT NULL,         -- SC (School of Computing)
    programme VARCHAR(10) NOT NULL,      -- U4 (Undergrad 4-year)
    department VARCHAR(10) NOT NULL,     -- CSE (Computer Science)
    year INTEGER NOT NULL,               -- 24 (2024)
    section VARCHAR(1) NOT NULL,         -- B (from 1 in 124)
    classRollNumber INTEGER NOT NULL,    -- 24 (from 124)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STUDENT COORDINATORS Collection
-- Document ID: auto-generated
CREATE TABLE studentcoordinator_structure (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rollNumber VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,         -- auto-generated from roll number
    eventName VARCHAR(50) NOT NULL,      -- Procession, Campus Decoration, Float, Culturals
    assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OD ENTRIES Collection
-- Document ID: rollNumber
-- Contains dynamic fields for each OD entry
CREATE TABLE od_entries_structure (
    rollNumber VARCHAR(20) PRIMARY KEY,
    -- Dynamic fields like "1234567890": {"date": "2024-01-15", "slot": 3}
    -- Each timestamp key contains an object with date and slot
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USERS Collection (for authentication)
-- Document ID: Firebase Auth UID
CREATE TABLE users_structure (
    uid VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,           -- admin, teacher, student, coordinator
    rollNumber VARCHAR(20),              -- only for students
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: These are documentation tables showing the structure.
-- Actual data is stored in Firestore NoSQL format.
