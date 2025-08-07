-- Sample data for testing the Firestore database

-- Sample Users
INSERT INTO users VALUES {
  "uid": "admin_001",
  "name": "System Administrator",
  "email": "admin@college.edu",
  "role": "admin",
  "department": "Administration",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "isActive": true
}

INSERT INTO users VALUES {
  "uid": "teacher_001",
  "name": "Dr. Rajesh Kumar",
  "email": "rajesh@college.edu",
  "role": "teacher",
  "department": "Computer Science",
  "section": "A",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "isActive": true
}

INSERT INTO users VALUES {
  "uid": "coordinator_001",
  "name": "Priya Sharma",
  "email": "priya@college.edu",
  "role": "coordinator",
  "department": "Computer Science",
  "rollNumber": "21CS001",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "isActive": true
}

INSERT INTO users VALUES {
  "uid": "student_001",
  "name": "Arjun Patel",
  "email": "arjun@student.college.edu",
  "role": "student",
  "department": "Computer Science",
  "section": "A",
  "rollNumber": "21CS002",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "isActive": true
}

-- Sample Events
INSERT INTO events VALUES {
  "title": "Tech Fest 2024",
  "description": "Annual technical festival with coding competitions and workshops",
  "date": "2024-03-15",
  "slug": "tech-fest-2024",
  "createdBy": "coordinator_001",
  "status": "active",
  "location": "Main Auditorium",
  "maxParticipants": 500,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}

INSERT INTO events VALUES {
  "title": "Cultural Fest",
  "description": "Inter-college cultural competition",
  "date": "2024-04-20",
  "slug": "cultural-fest-2024",
  "createdBy": "coordinator_001",
  "status": "upcoming",
  "location": "Open Ground",
  "maxParticipants": 300,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}

-- Sample Departments
INSERT INTO departments VALUES {
  "code": "CS",
  "name": "Computer Science",
  "head": "Dr. Rajesh Kumar",
  "sections": ["A", "B", "C"],
  "totalSlots": 12,
  "isActive": true
}

INSERT INTO departments VALUES {
  "code": "EC",
  "name": "Electronics and Communication",
  "head": "Dr. Meera Singh",
  "sections": ["A", "B"],
  "totalSlots": 12,
  "isActive": true
}

-- Sample Time Slots
INSERT INTO time_slots VALUES {
  "slotNumber": 1,
  "startTime": "08:00",
  "endTime": "08:50",
  "isActive": true,
  "type": "regular"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 2,
  "startTime": "08:50",
  "endTime": "09:40",
  "isActive": true,
  "type": "regular"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 3,
  "startTime": "09:40",
  "endTime": "10:30",
  "isActive": true,
  "type": "regular"
}

-- Break slot
INSERT INTO time_slots VALUES {
  "slotNumber": 4,
  "startTime": "10:30",
  "endTime": "10:45",
  "isActive": true,
  "type": "break"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 5,
  "startTime": "10:45",
  "endTime": "11:35",
  "isActive": true,
  "type": "regular"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 6,
  "startTime": "11:35",
  "endTime": "12:25",
  "isActive": true,
  "type": "regular"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 7,
  "startTime": "12:25",
  "endTime": "13:15",
  "isActive": true,
  "type": "regular"
}

-- Lunch break
INSERT INTO time_slots VALUES {
  "slotNumber": 8,
  "startTime": "13:15",
  "endTime": "14:05",
  "isActive": true,
  "type": "lunch"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 9,
  "startTime": "14:05",
  "endTime": "14:55",
  "isActive": true,
  "type": "regular"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 10,
  "startTime": "14:55",
  "endTime": "15:45",
  "isActive": true,
  "type": "regular"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 11,
  "startTime": "15:45",
  "endTime": "16:35",
  "isActive": true,
  "type": "regular"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 12,
  "startTime": "16:35",
  "endTime": "17:25",
  "isActive": true,
  "type": "regular"
}

INSERT INTO time_slots VALUES {
  "slotNumber": 13,
  "startTime": "17:25",
  "endTime": "18:15",
  "isActive": true,
  "type": "regular"
}
