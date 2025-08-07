-- Setup script for Firestore users collection
-- This documents the user roles and permissions structure

-- ADMIN USERS
-- These users have full access to all collections and operations
INSERT INTO users_documentation (role, permissions, description) VALUES 
('admin', 'full_access', 'Can manage all students, coordinators, and OD entries');

-- TEACHER USERS  
-- These users can view OD requests and student data for their department
INSERT INTO users_documentation (role, permissions, description) VALUES
('teacher', 'department_read', 'Can view students and OD data for their department');

-- STUDENT COORDINATOR USERS
-- These users can scan NFC tags and mark attendance for their assigned events
INSERT INTO users_documentation (role, permissions, description) VALUES
('coordinator', 'event_management', 'Can scan NFC and manage attendance for assigned events');

-- STUDENT USERS
-- These users can view their own OD status and submit requests
INSERT INTO users_documentation (role, permissions, description) VALUES
('student', 'self_read_write', 'Can view own OD status and submit requests');

-- Note: Actual user creation happens through Firebase Authentication
-- This is documentation of the role-based access control system
