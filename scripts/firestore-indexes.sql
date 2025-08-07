-- Firestore Composite Indexes for Optimized Queries
-- These indexes need to be created in Firebase Console

-- Index for od_requests collection
-- Query: Get OD requests by user and status
CREATE INDEX od_requests_user_status ON od_requests (userId ASC, status ASC, requestedAt DESC);

-- Query: Get OD requests by event and date
CREATE INDEX od_requests_event_date ON od_requests (eventId ASC, date ASC, slot ASC);

-- Query: Get OD requests by department and status (for teachers)
CREATE INDEX od_requests_dept_status ON od_requests (studentDetails.department ASC, status ASC, requestedAt DESC);

-- Query: Get OD requests by date and slot
CREATE INDEX od_requests_date_slot ON od_requests (date ASC, slot ASC, status ASC);

-- Index for scan_logs collection
-- Query: Get scan logs by user and date
CREATE INDEX scan_logs_user_date ON scan_logs (userId ASC, date ASC, scannedAt DESC);

-- Query: Get scan logs by event and slot
CREATE INDEX scan_logs_event_slot ON scan_logs (eventId ASC, slot ASC, scannedAt DESC);

-- Query: Get scan logs by date and location
CREATE INDEX scan_logs_date_location ON scan_logs (date ASC, location ASC, scannedAt DESC);

-- Index for events collection
-- Query: Get events by status and date
CREATE INDEX events_status_date ON events (status ASC, date ASC, createdAt DESC);

-- Query: Get events by creator
CREATE INDEX events_creator ON events (createdBy ASC, status ASC, date ASC);

-- Index for users collection
-- Query: Get users by role and department
CREATE INDEX users_role_dept ON users (role ASC, department ASC, name ASC);

-- Query: Get users by department and section
CREATE INDEX users_dept_section ON users (department ASC, section ASC, name ASC);
