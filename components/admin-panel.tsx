"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { addODEntry, getODEntriesForStudent, checkODExists } from "@/lib/od-operations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Upload,
  UserPlus,
  Users,
  Eye,
  FileText,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  LogOut,
  Search,
  Download,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import * as XLSX from "xlsx"

interface Student {
  id?: string
  name: string
  rollNumber: string
  email: string
  campus: string
  school: string
  programme: string
  department: string
  year: number
  section: string
  classRollNumber: number
}

interface StudentCoordinator {
  id?: string
  name: string
  rollNumber: string
  email: string
  eventName: string
  assignedAt: string
  role: string
}

// Utility function to parse roll number
const parseRollNumber = (rollNumber: string) => {
  // Format: CB.SC.U4CSE24124
  const parts = rollNumber.split(".")
  if (parts.length !== 3) throw new Error("Invalid roll number format")

  const campus = parts[0] // CB
  const school = parts[1] // SC
  const programmeAndRest = parts[2] // U4CSE24124

  const programme = programmeAndRest.substring(0, 2) // U4
  const department = programmeAndRest.substring(2, 5) // CSE
  const yearAndSection = programmeAndRest.substring(5) // 24124

  const year = Number.parseInt(yearAndSection.substring(0, 2)) // 24
  const sectionDigit = Number.parseInt(yearAndSection.substring(2, 3)) // 1
  const classRoll = Number.parseInt(yearAndSection.substring(3)) // 24

  // Convert section digit to letter (0=A, 1=B, 2=C, etc.)
  const section = String.fromCharCode(65 + sectionDigit) // A, B, C, etc.

  // Generate email
  const email = `${rollNumber.toLowerCase()}@cb.students.amrita.edu`

  return {
    campus,
    school,
    programme,
    department,
    year: 2000 + year, // Convert 24 to 2024
    section,
    classRollNumber: classRoll,
    email,
  }
}

export function AdminPanel() {
  const { userData, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("upload-csv")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  // States for different sections
  const [coordinators, setCoordinators] = useState<StudentCoordinator[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: "",
    rollNumber: "",
  })

  const [coordinatorForm, setCoordinatorForm] = useState({
    name: "",
    rollNumber: "",
    eventName: "",
  })

  const [odForm, setOdForm] = useState({
    rollNumber: "",
    date: "",
    slot: "",
  })

  const [searchForm, setSearchForm] = useState({
    rollNumber: "",
  })

  useEffect(() => {
    fetchCoordinators()
  }, [])

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  // CSV Upload Functions
  const handleCSVUpload = async () => {
    if (!csvFile) {
      showMessage("error", "Please select a CSV file")
      return
    }

    setLoading(true)
    try {
      const text = await csvFile.text()
      const lines = text.split("\n")

      const studentsData: Student[] = []
      const existingRollNumbers = new Set()

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(",").map((v) => v.trim())
        if (values.length >= 2 && values[0] && values[1]) {
          try {
            const rollNumber = values[0]
            const name = values[1]
            const parsed = parseRollNumber(rollNumber)

            const student: Student = {
              name,
              rollNumber,
              ...parsed,
            }

            // Deduplicate based on roll number
            if (!existingRollNumbers.has(student.rollNumber)) {
              existingRollNumbers.add(student.rollNumber)
              studentsData.push(student)
            }
          } catch (error) {
            console.error(`Error parsing roll number ${values[0]}:`, error)
          }
        }
      }

      // Upload to Firebase
      const batch = studentsData.map(async (student) => {
        await setDoc(doc(db, "students", student.rollNumber), {
          ...student,
          createdAt: new Date().toISOString(),
        })
      })

      await Promise.all(batch)
      showMessage("success", `Successfully uploaded ${studentsData.length} students`)
      setCsvFile(null)
    } catch (error: any) {
      showMessage("error", `Error uploading CSV file: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Manual Student Add
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const parsed = parseRollNumber(studentForm.rollNumber)
      const student: Student = {
        name: studentForm.name,
        rollNumber: studentForm.rollNumber,
        ...parsed,
      }

      await setDoc(doc(db, "students", studentForm.rollNumber), {
        ...student,
        createdAt: new Date().toISOString(),
      })

      showMessage("success", "Student added successfully")
      setStudentForm({
        name: "",
        rollNumber: "",
      })
    } catch (error: any) {
      showMessage("error", `Error adding student: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Coordinator Functions - Updated to use users collection
  const handleAssignCoordinator = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const parsed = parseRollNumber(coordinatorForm.rollNumber)

      // Create user document in users collection with coordinator role
      await setDoc(doc(db, "users", coordinatorForm.rollNumber), {
        name: coordinatorForm.name,
        rollNumber: coordinatorForm.rollNumber,
        email: parsed.email,
        role: "coordinator",
        department: parsed.department,
        section: parsed.section,
        eventName: coordinatorForm.eventName,
        assignedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true,
      })

      showMessage("success", "Coordinator assigned successfully")
      setCoordinatorForm({
        name: "",
        rollNumber: "",
        eventName: "",
      })
      fetchCoordinators()
    } catch (error: any) {
      showMessage("error", `Error assigning coordinator: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Updated to fetch from users collection
  const fetchCoordinators = async () => {
    try {
      setLoading(true)

      // Query users collection for coordinator role
      const coordinatorQuery = query(collection(db, "users"), where("role", "==", "coordinator"))

      const querySnapshot = await getDocs(coordinatorQuery)
      const coordinatorsData: StudentCoordinator[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        coordinatorsData.push({
          id: doc.id,
          name: data.name,
          rollNumber: data.rollNumber,
          email: data.email,
          eventName: data.eventName || "Not Assigned",
          assignedAt: data.assignedAt || data.createdAt,
          role: data.role,
        } as StudentCoordinator)
      })

      setCoordinators(coordinatorsData)
      console.log("Fetched coordinators:", coordinatorsData)
    } catch (error) {
      console.error("Error fetching coordinators:", error)
      showMessage("error", "Error fetching coordinators")
    } finally {
      setLoading(false)
    }
  }

  // Updated to remove from users collection
  const handleRemoveCoordinator = async (id: string) => {
    try {
      setLoading(true)
      await deleteDoc(doc(db, "users", id))
      showMessage("success", "Coordinator removed successfully")
      fetchCoordinators()
    } catch (error: any) {
      showMessage("error", `Error removing coordinator: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Updated OD Entry Functions using new structure
  const handleAddODEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if OD already exists for this date and slot
      const existingOD = await checkODExists(odForm.rollNumber, odForm.date, Number.parseInt(odForm.slot))

      if (existingOD.exists) {
        showMessage("error", `OD already exists for ${odForm.rollNumber} on ${odForm.date} slot ${odForm.slot}`)
        setLoading(false)
        return
      }

      const result = await addODEntry(
        odForm.rollNumber,
        odForm.date,
        Number.parseInt(odForm.slot),
        userData?.uid,
        userData?.name,
        "Manual Entry",
      )

      if (result.success) {
        showMessage("success", result.message)
        setOdForm({
          rollNumber: "",
          date: "",
          slot: "",
        })
      } else {
        showMessage("error", result.message)
      }
    } catch (error: any) {
      showMessage("error", `Error adding OD entry: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Search OD entries for a student
  const handleSearchOD = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await getODEntriesForStudent(searchForm.rollNumber)

      if (result.success) {
        setSearchResults(result.data)
        showMessage("success", result.message)
      } else {
        setSearchResults(null)
        showMessage("error", result.message)
      }
    } catch (error: any) {
      showMessage("error", `Error searching OD entries: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-black p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">OD Manager - Admin Panel</h1>
            <p className="text-gray-600">Welcome, {userData?.name || userData?.email}</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="border-black text-black hover:bg-gray-100 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className="p-4">
          <Alert className={`border-2 ${message.type === "success" ? "border-green-600" : "border-red-600"}`}>
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className={message.type === "success" ? "text-green-600" : "text-red-600"}>
              {message.text}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100 border-2 border-black">
              <TabsTrigger value="upload-csv" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Upload CSV</span>
              </TabsTrigger>
              <TabsTrigger value="add-student" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Student</span>
              </TabsTrigger>
              <TabsTrigger
                value="assign-coordinator"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Assign Coord</span>
              </TabsTrigger>
              <TabsTrigger
                value="view-coordinators"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">View Coords</span>
              </TabsTrigger>
              <TabsTrigger value="add-od" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add OD</span>
              </TabsTrigger>
              <TabsTrigger value="search-od" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Search OD</span>
              </TabsTrigger>
            </TabsList>

            {/* Upload CSV Tab */}
            <TabsContent value="upload-csv" className="mt-6">
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <Upload className="h-6 w-6 mr-2" />
                    Upload Student CSV
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="space-y-2">
                      <Label htmlFor="csv-upload" className="cursor-pointer">
                        <span className="text-lg font-medium text-black">Choose CSV File</span>
                        <Input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </Label>
                      {csvFile && <p className="text-sm text-gray-600">Selected: {csvFile.name}</p>}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded border">
                    <h4 className="font-bold text-black mb-2">CSV Format (Only 2 columns needed):</h4>
                    <p className="text-sm text-gray-600 mb-2">Roll Number, Name</p>
                    <p className="text-xs text-gray-500 mb-2">Example: CB.SC.U4CSE24124, John Doe</p>
                    <p className="text-xs text-gray-400">
                      Email, year, department, and section will be auto-calculated from roll number
                    </p>
                  </div>

                  <Button
                    onClick={handleCSVUpload}
                    disabled={!csvFile || loading}
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    {loading ? "Uploading..." : "Upload CSV"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add Student Tab */}
            <TabsContent value="add-student" className="mt-6">
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <UserPlus className="h-6 w-6 mr-2" />
                    Manually Add Student
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={studentForm.name}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          className="border-2 border-gray-300 focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="rollNumber">Roll Number</Label>
                        <Input
                          id="rollNumber"
                          value={studentForm.rollNumber}
                          onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                          className="border-2 border-gray-300 focus:border-black"
                          placeholder="CB.SC.U4CSE24124"
                          required
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                      <p>Email, year, department, and section will be auto-calculated from roll number</p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
                      {loading ? "Adding..." : "Add Student"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assign Coordinator Tab */}
            <TabsContent value="assign-coordinator" className="mt-6">
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <Users className="h-6 w-6 mr-2" />
                    Assign Student Coordinator - Gokulashtami
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAssignCoordinator} className="space-y-4">
                    <div>
                      <Label htmlFor="coord-name">Coordinator Name</Label>
                      <Input
                        id="coord-name"
                        value={coordinatorForm.name}
                        onChange={(e) => setCoordinatorForm({ ...coordinatorForm, name: e.target.value })}
                        className="border-2 border-gray-300 focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="coord-roll">Roll Number</Label>
                      <Input
                        id="coord-roll"
                        value={coordinatorForm.rollNumber}
                        onChange={(e) => setCoordinatorForm({ ...coordinatorForm, rollNumber: e.target.value })}
                        className="border-2 border-gray-300 focus:border-black"
                        placeholder="CB.SC.U4CSE24124"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-name">Gokulashtami Event</Label>
                      <Select
                        value={coordinatorForm.eventName}
                        onValueChange={(value) => setCoordinatorForm({ ...coordinatorForm, eventName: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-300 focus:border-black">
                          <SelectValue placeholder="Select Gokulashtami Event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Procession">Procession</SelectItem>
                          <SelectItem value="Campus Decoration">Campus Decoration</SelectItem>
                          <SelectItem value="Float">Float</SelectItem>
                          <SelectItem value="Culturals">Culturals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                      <p>Email will be auto-calculated from roll number</p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
                      {loading ? "Assigning..." : "Assign Coordinator"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* View Coordinators Tab - Updated */}
            <TabsContent value="view-coordinators" className="mt-6">
              <Card className="border-2 border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <Eye className="h-6 w-6 mr-2" />
                    Student Coordinators - Gokulashtami
                  </CardTitle>
                  <div className="flex space-x-2">
                    <AlertDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-black text-black hover:bg-gray-100 bg-transparent"
                          disabled={coordinators.length === 0}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Export Coordinator List</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will download the list of all coordinators as an Excel file.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              // Excel export logic
                              const exportData = coordinators.map(({ name, rollNumber, email, eventName, role }) => ({
                                Name: name,
                                "Roll Number": rollNumber,
                                Email: email,
                                "Event Assigned": eventName,
                                Role: role,
                              }))
                              const worksheet = XLSX.utils.json_to_sheet(exportData)
                              const workbook = XLSX.utils.book_new()
                              XLSX.utils.book_append_sheet(workbook, worksheet, "Coordinators")
                              XLSX.writeFile(workbook, "coordinators_list.xlsx")
                              setExportDialogOpen(false)
                            }}
                          >
                            Download
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      onClick={fetchCoordinators}
                      disabled={loading}
                      variant="outline"
                      className="border-black text-black hover:bg-gray-100 bg-transparent"
                    >
                      {loading ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2 border-black">
                          <TableHead className="font-bold text-black">Name</TableHead>
                          <TableHead className="font-bold text-black">Roll Number</TableHead>
                          <TableHead className="font-bold text-black">Email</TableHead>
                          <TableHead className="font-bold text-black">Event Assigned</TableHead>
                          <TableHead className="font-bold text-black">Role</TableHead>
                          <TableHead className="font-bold text-black">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coordinators.map((coordinator) => (
                          <TableRow key={coordinator.id} className="border-b border-gray-200">
                            <TableCell>{coordinator.name}</TableCell>
                            <TableCell>{coordinator.rollNumber}</TableCell>
                            <TableCell>{coordinator.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{coordinator.eventName}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{coordinator.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-black text-black hover:bg-gray-100 bg-transparent"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                                  onClick={() => coordinator.id && handleRemoveCoordinator(coordinator.id)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {coordinators.length === 0 && !loading && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No coordinators found</p>
                        <p className="text-sm">Assign coordinators using the "Assign Coord" tab</p>
                      </div>
                    )}
                    {loading && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                        <p>Loading coordinators...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add OD Entry Tab */}
            <TabsContent value="add-od" className="mt-6">
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <FileText className="h-6 w-6 mr-2" />
                    Manually Add OD Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded border-2 border-blue-200 mb-4">
                    <h4 className="font-bold text-blue-800 mb-2">📋 New OD Structure:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• One document per roll number in ODs collection</li>
                      <li>• Each OD entry gets appended as a new field with timestamp key</li>
                      <li>• Prevents duplicate entries for same date/slot</li>
                      <li>• Makes retrieval much faster for teachers</li>
                    </ul>
                  </div>
                  <form onSubmit={handleAddODEntry} className="space-y-4">
                    <div>
                      <Label htmlFor="od-roll">Roll Number</Label>
                      <Input
                        id="od-roll"
                        value={odForm.rollNumber}
                        onChange={(e) => setOdForm({ ...odForm, rollNumber: e.target.value })}
                        className="border-2 border-gray-300 focus:border-black"
                        placeholder="CB.SC.U4CSE24124"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="od-date">Date</Label>
                      <Input
                        id="od-date"
                        type="date"
                        value={odForm.date}
                        onChange={(e) => setOdForm({ ...odForm, date: e.target.value })}
                        className="border-2 border-gray-300 focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="od-slot">Slot Number</Label>
                      <Select value={odForm.slot} onValueChange={(value) => setOdForm({ ...odForm, slot: value })}>
                        <SelectTrigger className="border-2 border-gray-300 focus:border-black">
                          <SelectValue placeholder="Select Slot (1-12)" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((slot) => (
                            <SelectItem key={slot} value={slot.toString()}>
                              Slot {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
                      {loading ? "Adding..." : "Add OD Entry"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Search OD Tab */}
            <TabsContent value="search-od" className="mt-6">
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <Search className="h-6 w-6 mr-2" />
                    Search Student OD Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearchOD} className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="search-roll">Roll Number</Label>
                      <Input
                        id="search-roll"
                        value={searchForm.rollNumber}
                        onChange={(e) => setSearchForm({ ...searchForm, rollNumber: e.target.value })}
                        className="border-2 border-gray-300 focus:border-black"
                        placeholder="CB.SC.U4CSE24124"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
                      {loading ? "Searching..." : "Search OD Records"}
                    </Button>
                  </form>

                  {/* Search Results */}
                  {searchResults && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded border">
                        <h4 className="font-bold text-black mb-2">Student Information:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Name:</strong> {searchResults.studentInfo.studentName}
                          </div>
                          <div>
                            <strong>Roll Number:</strong> {searchResults.studentInfo.rollNumber}
                          </div>
                          <div>
                            <strong>Department:</strong> {searchResults.studentInfo.department}
                          </div>
                          <div>
                            <strong>Section:</strong> {searchResults.studentInfo.section}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-black mb-4">OD Entries ({searchResults.entries.length}):</h4>
                        {searchResults.entries.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">No OD entries found</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-b-2 border-black">
                                  <TableHead className="font-bold text-black">Date</TableHead>
                                  <TableHead className="font-bold text-black">Slot</TableHead>
                                  <TableHead className="font-bold text-black">Added By</TableHead>
                                  <TableHead className="font-bold text-black">Event</TableHead>
                                  <TableHead className="font-bold text-black">Created At</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {searchResults.entries.map((entry: any, index: number) => (
                                  <TableRow key={index} className="border-b border-gray-200">
                                    <TableCell>{entry.date}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">Slot {entry.slot}</Badge>
                                    </TableCell>
                                    <TableCell>{entry.coordinatorName || "System"}</TableCell>
                                    <TableCell>{entry.eventName || "Manual Entry"}</TableCell>
                                    <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
