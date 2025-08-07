// Optimized Firestore query functions

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, Event, ODRequest, ScanLog, Department, TimeSlot } from "./firestore-types"

// User queries
export const getUserById = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, "users", uid))
  return userDoc.exists() ? ({ ...userDoc.data(), uid: userDoc.id } as User) : null
}

export const getUsersByRole = async (role: string, department?: string): Promise<User[]> => {
  const constraints: QueryConstraint[] = [where("role", "==", role), where("isActive", "==", true), orderBy("name")]

  if (department) {
    constraints.splice(1, 0, where("department", "==", department))
  }

  const q = query(collection(db, "users"), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), uid: doc.id }) as User)
}

// Event queries
export const getActiveEvents = async (): Promise<Event[]> => {
  const q = query(
    collection(db, "events"),
    where("status", "==", "active"),
    orderBy("date"),
    orderBy("createdAt", "desc"),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Event)
}

export const getEventById = async (eventId: string): Promise<Event | null> => {
  const eventDoc = await getDoc(doc(db, "events", eventId))
  return eventDoc.exists() ? ({ ...eventDoc.data(), id: eventDoc.id } as Event) : null
}

export const createEvent = async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const now = new Date().toISOString()
  const docRef = await addDoc(collection(db, "events"), {
    ...eventData,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

// OD Request queries
export const getODRequestsByUser = async (userId: string, status?: string): Promise<ODRequest[]> => {
  const constraints: QueryConstraint[] = [where("userId", "==", userId), orderBy("requestedAt", "desc")]

  if (status) {
    constraints.splice(1, 0, where("status", "==", status))
  }

  const q = query(collection(db, "od_requests"), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ODRequest)
}

export const getODRequestsByEvent = async (eventId: string, date?: string): Promise<ODRequest[]> => {
  const constraints: QueryConstraint[] = [
    where("eventId", "==", eventId),
    orderBy("slot"),
    orderBy("requestedAt", "desc"),
  ]

  if (date) {
    constraints.splice(1, 0, where("date", "==", date))
  }

  const q = query(collection(db, "od_requests"), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ODRequest)
}

export const getODRequestsByDepartment = async (department: string, status?: string): Promise<ODRequest[]> => {
  const constraints: QueryConstraint[] = [
    where("studentDetails.department", "==", department),
    orderBy("requestedAt", "desc"),
  ]

  if (status) {
    constraints.splice(1, 0, where("status", "==", status))
  }

  const q = query(collection(db, "od_requests"), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ODRequest)
}

export const getODRequestsByDateAndSlot = async (date: string, slot: number): Promise<ODRequest[]> => {
  const q = query(
    collection(db, "od_requests"),
    where("date", "==", date),
    where("slot", "==", slot),
    where("status", "==", "approved"),
    orderBy("requestedAt", "desc"),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ODRequest)
}

export const createODRequest = async (requestData: Omit<ODRequest, "id" | "requestedAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, "od_requests"), {
    ...requestData,
    requestedAt: new Date().toISOString(),
  })
  return docRef.id
}

export const updateODRequestStatus = async (
  requestId: string,
  status: "approved" | "rejected",
  reviewedBy: string,
  reviewComments?: string,
): Promise<void> => {
  await updateDoc(doc(db, "od_requests", requestId), {
    status,
    reviewedBy,
    reviewedAt: new Date().toISOString(),
    reviewComments: reviewComments || "",
  })
}

// Scan Log queries
export const getScanLogsByUser = async (userId: string, date?: string): Promise<ScanLog[]> => {
  const constraints: QueryConstraint[] = [where("userId", "==", userId), orderBy("scannedAt", "desc")]

  if (date) {
    constraints.splice(1, 0, where("date", "==", date))
  }

  const q = query(collection(db, "scan_logs"), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ScanLog)
}

export const getScanLogsByEvent = async (eventId: string, slot?: number): Promise<ScanLog[]> => {
  const constraints: QueryConstraint[] = [where("eventId", "==", eventId), orderBy("scannedAt", "desc")]

  if (slot) {
    constraints.splice(1, 0, where("slot", "==", slot))
  }

  const q = query(collection(db, "scan_logs"), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as ScanLog)
}

export const createScanLog = async (scanData: Omit<ScanLog, "id" | "scannedAt">): Promise<string> => {
  const docRef = await addDoc(collection(db, "scan_logs"), {
    ...scanData,
    scannedAt: new Date().toISOString(),
  })
  return docRef.id
}

// Department queries
export const getAllDepartments = async (): Promise<Department[]> => {
  const q = query(collection(db, "departments"), where("isActive", "==", true), orderBy("name"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), code: doc.id }) as Department)
}

// Time Slot queries
export const getAllTimeSlots = async (): Promise<TimeSlot[]> => {
  const q = query(collection(db, "time_slots"), where("isActive", "==", true), orderBy("slotNumber"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data(), slotNumber: Number.parseInt(doc.id) }) as TimeSlot)
}

// Analytics queries
export const getODStatsByDate = async (date: string) => {
  const q = query(collection(db, "od_requests"), where("date", "==", date))
  const snapshot = await getDocs(q)

  const stats = {
    total: snapshot.size,
    pending: 0,
    approved: 0,
    rejected: 0,
    bySlot: {} as Record<number, number>,
    byDepartment: {} as Record<string, number>,
  }

  snapshot.docs.forEach((doc) => {
    const data = doc.data() as ODRequest
    stats[data.status as keyof typeof stats]++
    stats.bySlot[data.slot] = (stats.bySlot[data.slot] || 0) + 1
    stats.byDepartment[data.studentDetails.department] = (stats.byDepartment[data.studentDetails.department] || 0) + 1
  })

  return stats
}
