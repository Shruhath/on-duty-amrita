-- Firestore Database Structure for OD Marking App
-- This file documents the complete database schema

-- Collection: users
-- Document ID: {Firebase Auth UID}
-- Purpose: Store user profile information and roles
-- Indexes: role, department, section
{
  "uid": "firebase_auth_uid_here",
  "name": "John Doe",
  "email": "john.doe@college.edu",
  "role": "student", -- student, teacher, admin, coordinator
  "department": "Computer Science",
  "section": "A",
  "rollNumber": "21CS001", -- only for students
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "isActive": true
}

-- Collection: events
-- Document ID: {auto_generated}
-- Purpose: Store event information for OD requests
-- Indexes: status, date, createdBy, slug
{
  "id": "auto_generated_id",
  "title": "Tech Fest 2024",
  "description": "Annual technical festival with competitions and workshops",
  "date": "2024-03-15",
  "slug": "tech-fest-2024",
  "createdBy": "coordinator_uid",
  "status": "active", -- active, upcoming, completed, cancelled
  "location": "Main Auditorium",
  "maxParticipants": 500,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}

-- Collection: od_requests
-- Document ID: {auto_generated}
-- Purpose: Store OD requests from students
-- Indexes: userId, eventId, status, date, slot
{
  "id": "auto_generated_id",
  "userId": "student_uid",
  "eventId": "event_id",
  "slot": 5,
  "date": "2024-03-15",
  "status": "pending", -- pending, approved, rejected
  "reason": "Participating in coding competition",
  "requestedAt": "2024-01-01T00:00:00Z",
  "reviewedAt": null,
  "reviewedBy": null,
  "reviewComments": "",
  "studentDetails": {
    "name": "John Doe",
    "rollNumber": "21CS001",
    "department": "Computer Science",
    "section": "A"
  },
  "eventDetails": {
    "title": "Tech Fest 2024",
    "date": "2024-03-15"
  }
}

-- Collection: scan_logs
-- Document ID: {auto_generated}
-- Purpose: Store NFC scan logs for attendance tracking
-- Indexes: userId, eventId, slot, date, verifiedBy
{
  "id": "auto_generated_id",
  "userId": "student_uid",
  "eventId": "event_id",
  "slot": 5,
  "date": "2024-03-15",
  "scannedAt": "2024-03-15T10:30:00Z",
  "location": "Main Gate",
  "verifiedBy": "coordinator_uid",
  "scanType": "entry", -- entry, exit
  "deviceInfo": {
    "deviceId": "scanner_001",
    "coordinatorName": "Jane Smith"
  },
  "studentDetails": {
    "name": "John Doe",
    "rollNumber": "21CS001",
    "department": "Computer Science"
  }
}

-- Collection: departments
-- Document ID: {department_code}
-- Purpose: Store department information
{
  "code": "CS",
  "name": "Computer Science",
  "head": "Dr. Smith",
  "sections": ["A", "B", "C"],
  "totalSlots": 12,
  "isActive": true
}

-- Collection: time_slots
-- Document ID: {slot_number}
-- Purpose: Store time slot definitions
{
  "slotNumber": 1,
  "startTime": "08:00",
  "endTime": "08:50",
  "isActive": true,
  "type": "regular" -- regular, break, lunch
}
