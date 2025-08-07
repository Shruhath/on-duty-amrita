// Utility functions for Firestore operations

import { Timestamp } from "firebase/firestore"

// Convert Firestore Timestamp to ISO string
export const timestampToISO = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString()
}

// Convert ISO string to Firestore Timestamp
export const isoToTimestamp = (isoString: string): Timestamp => {
  return Timestamp.fromDate(new Date(isoString))
}

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate roll number format (e.g., 21CS001)
export const isValidRollNumber = (rollNumber: string): boolean => {
  const rollRegex = /^[0-9]{2}[A-Z]{2}[0-9]{3}$/
  return rollRegex.test(rollNumber)
}

// Get current academic year
export const getCurrentAcademicYear = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // JavaScript months are 0-indexed

  // Academic year starts in June (month 6)
  if (month >= 6) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Format time for display
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Get slot time range
export const getSlotTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

// Check if user has permission
export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole)
}

// Generate unique document ID
export const generateDocId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Batch operations helper
export const chunkArray = (array: any[], chunkSize: number): any[][] => {
  const chunks: any[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

// Error handling helper
export const handleFirestoreError = (error: any): string => {
  console.error("Firestore error:", error)

  switch (error.code) {
    case "permission-denied":
      return "You do not have permission to perform this action."
    case "not-found":
      return "The requested document was not found."
    case "already-exists":
      return "A document with this ID already exists."
    case "resource-exhausted":
      return "Too many requests. Please try again later."
    case "unauthenticated":
      return "You must be logged in to perform this action."
    default:
      return "An unexpected error occurred. Please try again."
  }
}
