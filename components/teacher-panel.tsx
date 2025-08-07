"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getODEntriesForStudent } from "@/lib/od-operations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Search, LogOut, FileText, Users, CheckCircle, AlertCircle } from "lucide-react"

interface SearchFilters {
  rollNumber: string
  date: string
  slot: string
  department: string
}

export function TeacherPanel() {
  const { userData, logout } = useAuth()
  const [filters, setFilters] = useState<SearchFilters>({
    rollNumber: "",
    date: "",
    slot: "",
    department: "",
  })
  const [searchResults, setSearchResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!filters.rollNumber.trim()) {
      showMessage("error", "Please enter a roll number to search")
      return
    }

    setLoading(true)
    try {
      const result = await getODEntriesForStudent(filters.rollNumber.trim())

      if (result.success && result.data) {
        // Apply additional filters if specified
        let filteredEntries = result.data.entries

        // Filter by date if specified
        if (filters.date) {
          filteredEntries = filteredEntries.filter((entry) => entry.date === filters.date)
        }

        // Filter by slot if specified
        if (filters.slot && filters.slot !== "0") {
          filteredEntries = filteredEntries.filter((entry) => entry.slot === Number.parseInt(filters.slot))
        }

        // Filter by department if specified (check student's department)
        if (filters.department && filters.department !== "0") {
          if (result.data.studentInfo.department !== filters.department) {
            filteredEntries = []
          }
        }

        setSearchResults({
          ...result.data,
          entries: filteredEntries,
          originalCount: result.data.entries.length,
          filteredCount: filteredEntries.length,
        })

        if (filteredEntries.length === 0 && result.data.entries.length > 0) {
          showMessage("success", `Found ${result.data.entries.length} total OD entries, but none match your filters`)
        } else {
          showMessage(
            "success",
            `Found ${filteredEntries.length} OD entries for ${result.data.studentInfo.studentName}`,
          )
        }
      } else {
        setSearchResults(null)
        showMessage("error", result.message || "No OD records found for this student")
      }
    } catch (error: any) {
      setSearchResults(null)
      showMessage("error", `Error searching OD entries: ${error.message}`)
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setFilters({
      rollNumber: "",
      date: "",
      slot: "",
      department: "",
    })
    setSearchResults(null)
    setMessage({ type: "", text: "" })
  }

  const getSlotTimeRange = (slot: number) => {
    const slotTimes: Record<number, string> = {
      1: "08:00 - 08:50",
      2: "08:50 - 09:40",
      3: "09:40 - 10:30",
      4: "10:45 - 11:35",
      5: "11:35 - 12:25",
      6: "12:25 - 13:15",
      7: "13:15 - 14:05", // Lunch
      8: "14:05 - 14:55",
      9: "14:55 - 15:45",
      10: "15:45 - 16:35",
      11: "16:35 - 17:25",
      12: "17:25 - 18:15",
    }
    return slotTimes[slot] || `Slot ${slot}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-black p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">OD Manager - Teacher Panel</h1>
            <p className="text-gray-600">Welcome, {userData?.name || userData?.email}</p>
            <p className="text-sm text-gray-500">Department: {userData?.department || "All Departments"}</p>
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

      <div className="p-4 space-y-6">
        {/* Search Filters */}
        <Card className="border-2 border-black">
          <CardHeader className="border-b-2 border-black bg-gray-50">
            <CardTitle className="text-black flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Student OD Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-blue-50 p-4 rounded border-2 border-blue-200 mb-4">
              <h4 className="font-bold text-blue-800 mb-2">🔍 Enhanced Search:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Enter roll number to get ALL OD records for that student</li>
                <li>• Use additional filters to narrow down results</li>
                <li>• Fast retrieval using new document structure</li>
                <li>• View complete OD history instantly</li>
              </ul>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="rollNumber" className="text-black font-medium">
                    Roll Number *
                  </Label>
                  <Input
                    id="rollNumber"
                    value={filters.rollNumber}
                    onChange={(e) => setFilters({ ...filters, rollNumber: e.target.value.toUpperCase() })}
                    className="border-2 border-gray-300 focus:border-black"
                    placeholder="CB.SC.U4CSE24124"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-black font-medium">
                    Date (Optional)
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    className="border-2 border-gray-300 focus:border-black"
                  />
                </div>
                <div>
                  <Label htmlFor="slot" className="text-black font-medium">
                    Slot (Optional)
                  </Label>
                  <Select value={filters.slot} onValueChange={(value) => setFilters({ ...filters, slot: value })}>
                    <SelectTrigger className="border-2 border-gray-300 focus:border-black">
                      <SelectValue placeholder="All Slots" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Slots</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((slot) => (
                        <SelectItem key={slot} value={slot.toString()}>
                          Slot {slot} ({getSlotTimeRange(slot)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department" className="text-black font-medium">
                    Department (Optional)
                  </Label>
                  <Select
                    value={filters.department}
                    onValueChange={(value) => setFilters({ ...filters, department: value })}
                  >
                    <SelectTrigger className="border-2 border-gray-300 focus:border-black">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Departments</SelectItem>
                      <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                      <SelectItem value="ECE">Electronics (ECE)</SelectItem>
                      <SelectItem value="EEE">Electrical (EEE)</SelectItem>
                      <SelectItem value="MECH">Mechanical (MECH)</SelectItem>
                      <SelectItem value="CIVIL">Civil (CIVIL)</SelectItem>
                      <SelectItem value="IT">Information Technology (IT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-black text-white hover:bg-gray-800">
                  {loading ? "Searching..." : "Search OD Records"}
                </Button>
                <Button
                  type="button"
                  onClick={clearSearch}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100 bg-transparent"
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card className="border-2 border-black">
          <CardHeader className="border-b-2 border-black bg-gray-50">
            <CardTitle className="text-black flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Search Results
              {searchResults && (
                <Badge variant="outline" className="ml-2">
                  {searchResults.filteredCount} of {searchResults.originalCount} entries
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Searching OD records...</p>
              </div>
            ) : searchResults ? (
              <div className="space-y-6">
                {/* Student Information */}
                <div className="bg-gray-50 p-4 rounded border">
                  <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong className="text-black">Name:</strong>
                      <br />
                      <span className="text-gray-700">{searchResults.studentInfo.studentName}</span>
                    </div>
                    <div>
                      <strong className="text-black">Roll Number:</strong>
                      <br />
                      <span className="text-gray-700 font-mono">{searchResults.studentInfo.rollNumber}</span>
                    </div>
                    <div>
                      <strong className="text-black">Department:</strong>
                      <br />
                      <span className="text-gray-700">{searchResults.studentInfo.department}</span>
                    </div>
                    <div>
                      <strong className="text-black">Section:</strong>
                      <br />
                      <span className="text-gray-700">{searchResults.studentInfo.section}</span>
                    </div>
                  </div>
                </div>

                {/* OD Entries */}
                <div>
                  <h4 className="font-bold text-black mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    OD Entries ({searchResults.filteredCount})
                    {searchResults.filteredCount !== searchResults.originalCount && (
                      <span className="text-sm font-normal text-gray-600">
                        (filtered from {searchResults.originalCount} total)
                      </span>
                    )}
                  </h4>

                  {searchResults.entries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {searchResults.originalCount > 0
                          ? "No OD entries match your filters"
                          : "No OD entries found for this student"}
                      </p>
                      {searchResults.originalCount > 0 && (
                        <p className="text-sm mt-2">Try removing some filters to see more results</p>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b-2 border-black">
                            <TableHead className="font-bold text-black">Date</TableHead>
                            <TableHead className="font-bold text-black">Slot</TableHead>
                            <TableHead className="font-bold text-black">Time</TableHead>
                            <TableHead className="font-bold text-black">Added By</TableHead>
                            <TableHead className="font-bold text-black">Event</TableHead>
                            <TableHead className="font-bold text-black">Created At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.entries.map((entry: any, index: number) => (
                            <TableRow key={index} className="border-b border-gray-200">
                              <TableCell className="font-medium">
                                {new Date(entry.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  Slot {entry.slot}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">{getSlotTimeRange(entry.slot)}</TableCell>
                              <TableCell>{entry.coordinatorName || "System"}</TableCell>
                              <TableCell>
                                <Badge className="bg-blue-600 text-white">{entry.eventName || "Manual Entry"}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(entry.createdAt).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Enter a roll number above to search for OD records</p>
                <p className="text-sm mt-2">Use the enhanced search to find student attendance records instantly</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
