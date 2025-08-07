// TypeScript interfaces for Firestore collections

export interface User {
  uid: string
  name: string
  email: string
  role: "student" | "teacher" | "admin" | "coordinator"
  department: string
  section?: string
  rollNumber?: string // Only for students
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  slug: string
  createdBy: string
  status: "active" | "upcoming" | "completed" | "cancelled"
  location: string
  maxParticipants: number
  createdAt: string
  updatedAt: string
}

export interface ODRequest {
  id: string
  userId: string
  eventId: string
  slot: number
  date: string
  status: "pending" | "approved" | "rejected"
  reason: string
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewComments?: string
  studentDetails: {
    name: string
    rollNumber: string
    department: string
    section: string
  }
  eventDetails: {
    title: string
    date: string
  }
}

export interface ScanLog {
  id: string
  userId: string
  eventId: string
  slot: number
  date: string
  scannedAt: string
  location: string
  verifiedBy: string
  scanType: "entry" | "exit"
  deviceInfo: {
    deviceId: string
    coordinatorName: string
  }
  studentDetails: {
    name: string
    rollNumber: string
    department: string
  }
}

export interface Department {
  code: string
  name: string
  head: string
  sections: string[]
  totalSlots: number
  isActive: boolean
}

export interface TimeSlot {
  slotNumber: number
  startTime: string
  endTime: string
  isActive: boolean
  type: "regular" | "break" | "lunch"
}

// Query result types
export interface ODRequestWithDetails extends ODRequest {
  eventTitle: string
  studentName: string
}

export interface ScanLogWithDetails extends ScanLog {
  eventTitle: string
  studentName: string
  coordinatorName: string
}
