"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Users } from "lucide-react"

interface ODEntry {
  date: string
  slot: number
  createdAt: string
  coordinatorName?: string
  eventName?: string
  timestamp: string
}

interface StudentInfo {
  rollNumber: string
  studentName: string
  department: string
  section: string
}

interface ODSearchResultsProps {
  results: {
    studentInfo: StudentInfo
    entries: ODEntry[]
    originalCount?: number
    filteredCount?: number
  } | null
  loading: boolean
}

export function ODSearchResults({ results, loading }: ODSearchResultsProps) {
  const getSlotTimeRange = (slot: number) => {
    const slotTimes: Record<number, string> = {
      1: "08:00 - 08:50",
      2: "08:50 - 09:40",
      3: "09:40 - 10:30",
      4: "10:45 - 11:35",
      5: "11:35 - 12:25",
      6: "12:25 - 13:15",
      7: "13:15 - 14:05",
      8: "14:05 - 14:55",
      9: "14:55 - 15:45",
      10: "15:45 - 16:35",
      11: "16:35 - 17:25",
      12: "17:25 - 18:15",
    }
    return slotTimes[slot] || `Slot ${slot}`
  }

  if (loading) {
    return (
      <Card className="border-2 border-black">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Searching OD records...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!results) {
    return (
      <Card className="border-2 border-black">
        <CardHeader className="border-b-2 border-black bg-gray-50">
          <CardTitle className="text-black flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Search Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Enter a roll number to search for OD records</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-black">
      <CardHeader className="border-b-2 border-black bg-gray-50">
        <CardTitle className="text-black flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Search Results
          <Badge variant="outline" className="ml-2">
            {results.filteredCount || results.entries.length} entries
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
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
              <span className="text-gray-700">{results.studentInfo.studentName}</span>
            </div>
            <div>
              <strong className="text-black">Roll Number:</strong>
              <br />
              <span className="text-gray-700 font-mono">{results.studentInfo.rollNumber}</span>
            </div>
            <div>
              <strong className="text-black">Department:</strong>
              <br />
              <span className="text-gray-700">{results.studentInfo.department}</span>
            </div>
            <div>
              <strong className="text-black">Section:</strong>
              <br />
              <span className="text-gray-700">{results.studentInfo.section}</span>
            </div>
          </div>
        </div>

        {/* OD Entries */}
        <div>
          <h4 className="font-bold text-black mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            OD Entries ({results.entries.length})
          </h4>

          {results.entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No OD entries found for this student</p>
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
                  {results.entries.map((entry, index) => (
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
      </CardContent>
    </Card>
  )
}
