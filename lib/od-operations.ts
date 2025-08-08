"use client"

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ODEntry {
  date: string
  slot: number
  createdAt: string
  coordinatorId?: string
  coordinatorName?: string
  eventName?: string
}

interface ODDocument {
  rollNumber: string
  studentName: string
  department: string
  section: string
  createdAt: string
  [key: string]: any // For dynamic timestamp keys
}

// Add new OD entry for a student
export const addODEntry = async (
  rollNumber: string,
  date: string,
  slot: number,
  coordinatorId?: string,
  coordinatorName?: string,
  eventName?: string,
): Promise<{ success: boolean; message: string; isNewDocument: boolean }> => {
  try {
    const odDocRef = doc(db, "ODs", rollNumber)
    const odDoc = await getDoc(odDocRef)

    // Get student details from students collection
    const studentDocRef = doc(db, "students", rollNumber)
    const studentDoc = await getDoc(studentDocRef)

    if (!studentDoc.exists()) {
      return {
        success: false,
        message: "Student not found in database",
        isNewDocument: false,
      }
    }

    const studentData = studentDoc.data()
    const timestamp = Date.now().toString()

    const odEntry: ODEntry = {
      date,
      slot,
      createdAt: new Date().toISOString(),
      ...(coordinatorId && { coordinatorId }),
      ...(coordinatorName && { coordinatorName }),
      ...(eventName && { eventName }),
    }

    if (!odDoc.exists()) {
      // Create new document for this roll number
      const newODDocument: ODDocument = {
        rollNumber,
        studentName: studentData.name,
        department: studentData.department,
        section: studentData.section,
        createdAt: new Date().toISOString(),
        [timestamp]: odEntry,
      }

      await setDoc(odDocRef, newODDocument)

      return {
        success: true,
        message: `New OD document created for ${studentData.name}`,
        isNewDocument: true,
      }
    } else {
      // Append to existing document
      await updateDoc(odDocRef, {
        [timestamp]: odEntry,
      })

      return {
        success: true,
        message: `OD entry added for ${studentData.name}`,
        isNewDocument: false,
      }
    }
  } catch (error: any) {
    console.error("Error adding OD entry:", error)
    return {
      success: false,
      message: `Error: ${error.message}`,
      isNewDocument: false,
    }
  }
}

// Get all OD entries for a specific roll number
export const getODEntriesForStudent = async (
  rollNumber: string,
): Promise<{
  success: boolean
  data: {
    studentInfo: {
      rollNumber: string
      studentName: string
      department: string
      section: string
    }
    entries: Array<ODEntry & { timestamp: string }>
  } | null
  message: string
}> => {
  try {
    const odDocRef = doc(db, "ODs", rollNumber)
    const odDoc = await getDoc(odDocRef)

    if (!odDoc.exists()) {
      return {
        success: false,
        data: null,
        message: "No OD entries found for this student",
      }
    }

    const docData = odDoc.data()
    const { rollNumber: roll, studentName, department, section, createdAt, ...entries } = docData

    // Convert timestamp keys to entries array
    const odEntries = Object.entries(entries)
      .map(([timestamp, entry]) => ({
        timestamp,
        ...(entry as ODEntry),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
      success: true,
      data: {
        studentInfo: {
          rollNumber: roll,
          studentName,
          department,
          section,
        },
        entries: odEntries,
      },
      message: `Found ${odEntries.length} OD entries`,
    }
  } catch (error: any) {
    console.error("Error fetching OD entries:", error)
    return {
      success: false,
      data: null,
      message: `Error: ${error.message}`,
    }
  }
}

// Get OD entries for a specific date and slot (for teachers)
export const getODEntriesForDateAndSlot = async (
  date: string,
  slot?: number,
  department?: string,
): Promise<{
  success: boolean
  data: Array<{
    rollNumber: string
    studentName: string
    department: string
    section: string
    odEntry: ODEntry & { timestamp: string }
  }>
  message: string
}> => {
  try {
    // This would require a more complex query in a real implementation
    // For now, we'll return a placeholder
    return {
      success: true,
      data: [],
      message: "Query functionality to be implemented with proper indexing",
    }
  } catch (error: any) {
    return {
      success: false,
      data: [],
      message: `Error: ${error.message}`,
    }
  }
}

// Check if student has OD for specific date and slot
export const checkODExists = async (
  rollNumber: string,
  date: string,
  slot: number,
): Promise<{ exists: boolean; entry?: ODEntry & { timestamp: string } }> => {
  try {
    const result = await getODEntriesForStudent(rollNumber)

    if (!result.success || !result.data) {
      return { exists: false }
    }

    const existingEntry = result.data.entries.find((entry) => entry.date === date && entry.slot === slot)

    return {
      exists: !!existingEntry,
      entry: existingEntry,
    }
  } catch (error) {
    console.error("Error checking OD existence:", error)
    return { exists: false }
  }
}

// Get total OD count for a student
export const getODCountForStudent = async (rollNumber: string): Promise<number> => {
  try {
    const result = await getODEntriesForStudent(rollNumber)
    return result.success && result.data ? result.data.entries.length : 0
  } catch (error) {
    console.error("Error getting OD count:", error)
    return 0
  }
}

// Get all OD entries by event and date (for teachers)
export const getODEntriesByEventAndDate = async (
  eventName: string,
  date: string
): Promise<{
  success: boolean
  data: Array<{
    rollNumber: string
    studentName: string
    department: string
    section: string
    slot: number
    createdAt: string
    coordinatorName?: string
    coordinatorId?: string
  }>
  message: string
}> => {
  try {
    const { collection, getDocs } = await import("firebase/firestore")
    
    // Get all OD documents
    const odsCollection = collection(db, "ODs")
    const snapshot = await getDocs(odsCollection)
    
    const matchingEntries: Array<{
      rollNumber: string
      studentName: string
      department: string
      section: string
      slot: number
      createdAt: string
      coordinatorName?: string
      coordinatorId?: string
    }> = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      const { rollNumber, studentName, department, section, createdAt, ...entries } = data

      // Check each OD entry in the document
      Object.entries(entries).forEach(([timestamp, entry]: [string, any]) => {
        if (entry.date === date && entry.eventName === eventName) {
          matchingEntries.push({
            rollNumber,
            studentName,
            department,
            section,
            slot: entry.slot,
            createdAt: entry.createdAt,
            coordinatorName: entry.coordinatorName,
            coordinatorId: entry.coordinatorId,
          })
        }
      })
    })

    // Sort by department, then by roll number
    matchingEntries.sort((a, b) => {
      if (a.department !== b.department) {
        return a.department.localeCompare(b.department)
      }
      return a.rollNumber.localeCompare(b.rollNumber)
    })

    return {
      success: true,
      data: matchingEntries,
      message: `Found ${matchingEntries.length} OD entries for ${eventName} on ${date}`,
    }
  } catch (error: any) {
    console.error("Error fetching OD entries by event and date:", error)
    return {
      success: false,
      data: [],
      message: `Error: ${error.message}`,
    }
  }
}

// Check if current time is after 5 PM
export const isAfter5PM = (): boolean => {
  const now = new Date()
  const currentHour = now.getHours()
  return currentHour >= 17 // 5 PM or later
}
