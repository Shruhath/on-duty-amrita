-- Firestore Collections Setup for OD Manager
-- This script documents the Firestore collections structure

-- Collection: users
-- Document ID: user.uid
-- Fields:
--   - uid: string (Firebase Auth UID)
--   - name: string
--   - email: string
--   - role: string (student, teacher, admin, coordinator)
--   - department: string
--   - section: string
--   - rollNumber: string (for students)
--   - createdAt: timestamp
--   - updatedAt: timestamp

-- Collection: students
-- Document ID: rollNumber
-- Fields:
--   - name: string
--   - rollNumber: string
--   - email: string (auto-generated from roll number)
--   - year: number (extracted from roll number)
--   - department: string (extracted from roll number)
--   - section: string (extracted from roll number)
--   - campus: string (extracted from roll number)
--   - school: string (extracted from roll number)
--   - programme: string (extracted from roll number)
--   - createdAt: timestamp

-- Collection: studentcoordinator
-- Document ID: auto-generated
-- Fields:
--   - name: string
--   - rollNumber: string
--   - email: string (auto-generated from roll number)
--   - eventName: string
--   - assignedAt: timestamp

-- Collection: ODs
-- Document ID: rollNumber
-- Fields:
--   - Dynamic keys with OD entries
--   - Each entry contains: date, slot, createdAt

-- Collection: events
-- Document ID: auto-generated
-- Fields:
--   - title: string
--   - description: string
--   - date: string
--   - createdBy: string
--   - status: string

-- Note: This is a documentation file. 
-- Actual Firestore collections are created programmatically through the application.
