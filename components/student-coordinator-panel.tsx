"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { addODEntry, checkODExists } from "@/lib/od-operations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Nfc, LogOut, AlertCircle, CheckCircle, Play, Square, Edit3, Clock, Users, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface ScanResult {
  rollNumber: string
  studentName: string
  timestamp: string
  status: "success" | "error" | "duplicate"
  message: string
}

interface WriteResult {
  rollNumber: string
  timestamp: string
  status: "success" | "error"
  message: string
}

export function StudentCoordinatorPanel() {
  const { userData, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("nfc-scan")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  // NFC Scanning states
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [scanCount, setScanCount] = useState(0)

  // NFC Writing states
  const [isWriting, setIsWriting] = useState(false)
  const [writeResults, setWriteResults] = useState<WriteResult[]>([])
  const [writeRollNumber, setWriteRollNumber] = useState("")

  // Manual entry states
  const [manualRollNumber, setManualRollNumber] = useState("")

  // NFC Reader reference to properly clean up
  const ndefReaderRef = useRef<any>(null)
  const readingHandlerRef = useRef<any>(null)
  const errorHandlerRef = useRef<any>(null)

  // Cleanup NFC listeners on component unmount
  useEffect(() => {
    return () => {
      cleanupNFCListeners()
    }
  }, [])

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  // Clean up NFC event listeners
  const cleanupNFCListeners = () => {
    if (ndefReaderRef.current && readingHandlerRef.current) {
      ndefReaderRef.current.removeEventListener("reading", readingHandlerRef.current)
    }
    if (ndefReaderRef.current && errorHandlerRef.current) {
      ndefReaderRef.current.removeEventListener("readingerror", errorHandlerRef.current)
    }
    ndefReaderRef.current = null
    readingHandlerRef.current = null
    errorHandlerRef.current = null
  }

  // Validate roll number format
  const validateRollNumber = (rollNumber: string): boolean => {
    const rollPattern = /^CB\.SC\.U4[A-Z]{3}\d{5}$/
    return rollPattern.test(rollNumber)
  }

  // Get current slot (for testing, always return 99)
  const getCurrentSlot = (): number => {
    return 99 // Testing slot
  }

  // Process OD entry (common function for both scan and manual)
  const processODEntry = async (rollNumber: string, source: "nfc" | "manual"): Promise<ScanResult> => {
    try {
      if (!validateRollNumber(rollNumber)) {
        return {
          rollNumber,
          studentName: "Unknown",
          timestamp: new Date().toISOString(),
          status: "error",
          message: "Invalid roll number format",
        }
      }

      const today = new Date().toISOString().split("T")[0]
      const slot = getCurrentSlot()

      // Check if OD already exists
      const existingOD = await checkODExists(rollNumber, today, slot)
      if (existingOD.exists) {
        return {
          rollNumber,
          studentName: existingOD.entry?.studentName || "Unknown",
          timestamp: new Date().toISOString(),
          status: "duplicate",
          message: `OD already exists for slot ${slot}`,
        }
      }

      // Get student info
      const studentDoc = await getDoc(doc(db, "students", rollNumber))
      if (!studentDoc.exists()) {
        return {
          rollNumber,
          studentName: "Unknown",
          timestamp: new Date().toISOString(),
          status: "error",
          message: "Student not found in database",
        }
      }

      const studentData = studentDoc.data()
      const studentName = studentData.name

      // Add OD entry
      const result = await addODEntry(
        rollNumber,
        today,
        slot,
        userData?.uid,
        userData?.name,
        userData?.eventName || "Gokulashtami Event",
      )

      if (result.success) {
        return {
          rollNumber,
          studentName,
          timestamp: new Date().toISOString(),
          status: "success",
          message: `OD added for slot ${slot}`,
        }
      } else {
        return {
          rollNumber,
          studentName,
          timestamp: new Date().toISOString(),
          status: "error",
          message: result.message,
        }
      }
    } catch (error: any) {
      return {
        rollNumber,
        studentName: "Unknown",
        timestamp: new Date().toISOString(),
        status: "error",
        message: error.message || "Failed to process OD entry",
      }
    }
  }

  // NFC Scanning functions
  const startNFCScanning = async () => {
    if (!("NDEFReader" in window)) {
      showMessage("error", "NFC not supported on this device")
      return
    }

    try {
      // Clean up any existing listeners first
      cleanupNFCListeners()

      setIsScanning(true)
      setLoading(true)
      showMessage("success", "NFC scanning started - hold cards near device")

      // Create new NDEF reader
      const ndef = new (window as any).NDEFReader()
      ndefReaderRef.current = ndef

      // Create event handler functions
      readingHandlerRef.current = async (event: any) => {
        try {
          const decoder = new TextDecoder()
          let rollNumber = ""

          for (const record of event.message.records) {
            if (record.recordType === "text") {
              rollNumber = decoder.decode(record.data).trim().toUpperCase()
              break
            }
          }

          if (rollNumber) {
            console.log(`Processing NFC scan for: ${rollNumber}`)
            const result = await processODEntry(rollNumber, "nfc")

            setScanResults((prev) => [result, ...prev])

            // Only increment count for successful scans and new duplicates
            if (result.status === "success" || result.status === "duplicate") {
              setScanCount((prev) => prev + 1)
            }

            // Show appropriate message
            if (result.status === "success") {
              showMessage("success", `✅ ${result.message}`)
            } else if (result.status === "duplicate") {
              showMessage("error", `⚠️ ${result.message}`)
            } else {
              showMessage("error", `❌ ${result.message}`)
            }
          } else {
            showMessage("error", "No valid roll number found on NFC tag")
          }
        } catch (error) {
          console.error("Error processing NFC scan:", error)
          showMessage("error", "Error processing NFC scan")
        }
      }

      errorHandlerRef.current = () => {
        showMessage("error", "Error reading NFC tag")
      }

      // Add event listeners
      ndef.addEventListener("reading", readingHandlerRef.current)
      ndef.addEventListener("readingerror", errorHandlerRef.current)

      // Start scanning
      await ndef.scan()
    } catch (error: any) {
      showMessage("error", `NFC Error: ${error.message}`)
      setIsScanning(false)
      cleanupNFCListeners()
    } finally {
      setLoading(false)
    }
  }

  const stopNFCScanning = () => {
    setIsScanning(false)
    cleanupNFCListeners()
    showMessage("success", "NFC scanning stopped")
  }

  // Manual entry function
  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualRollNumber.trim()) return

    setLoading(true)
    try {
      const result = await processODEntry(manualRollNumber.trim().toUpperCase(), "manual")
      setScanResults((prev) => [result, ...prev])

      // Only increment count for successful scans and new duplicates
      if (result.status === "success" || result.status === "duplicate") {
        setScanCount((prev) => prev + 1)
      }

      setManualRollNumber("")

      // Show appropriate message
      if (result.status === "success") {
        showMessage("success", `✅ ${result.message}`)
      } else if (result.status === "duplicate") {
        showMessage("error", `⚠️ ${result.message}`)
      } else {
        showMessage("error", `❌ ${result.message}`)
      }
    } catch (error) {
      showMessage("error", "Error processing manual entry")
    } finally {
      setLoading(false)
    }
  }

  // NFC Writing functions
  const handleNFCWrite = async () => {
    if (!writeRollNumber.trim()) {
      showMessage("error", "Please enter a roll number to write")
      return
    }

    if (!validateRollNumber(writeRollNumber.trim())) {
      showMessage("error", "Invalid roll number format")
      return
    }

    if (!("NDEFReader" in window)) {
      showMessage("error", "NFC not supported on this device")
      return
    }

    try {
      setIsWriting(true)
      setLoading(true)
      showMessage("success", "Hold blank NFC card near device to write...")

      const ndef = new (window as any).NDEFReader()

      await ndef.write({
        records: [
          {
            recordType: "text",
            data: writeRollNumber.trim().toUpperCase(),
          },
        ],
      })

      const writeResult: WriteResult = {
        rollNumber: writeRollNumber.trim().toUpperCase(),
        timestamp: new Date().toISOString(),
        status: "success",
        message: "Roll number written successfully",
      }

      setWriteResults((prev) => [writeResult, ...prev])
      showMessage("success", "Roll number written to NFC card successfully!")
      setWriteRollNumber("")
    } catch (error: any) {
      const writeResult: WriteResult = {
        rollNumber: writeRollNumber.trim().toUpperCase(),
        timestamp: new Date().toISOString(),
        status: "error",
        message: error.message || "Failed to write to NFC card",
      }

      setWriteResults((prev) => [writeResult, ...prev])
      showMessage("error", `NFC Write Error: ${error.message}`)
    } finally {
      setIsWriting(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-black p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">Student Coordinator Panel</h1>
            <p className="text-gray-600">
              Welcome, {userData?.name} - {userData?.eventName || "Gokulashtami Event"}
            </p>
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

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 border-2 border-black">
            <TabsTrigger value="nfc-scan" className="data-[state=active]:bg-black data-[state=active]:text-white">
              <Nfc className="h-4 w-4 mr-2" />
              NFC Scan
            </TabsTrigger>
            <TabsTrigger value="nfc-write" className="data-[state=active]:bg-black data-[state=active]:text-white">
              <Edit3 className="h-4 w-4 mr-2" />
              NFC Write
            </TabsTrigger>
          </TabsList>

          {/* NFC Scan Tab */}
          <TabsContent value="nfc-scan" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scanning Controls */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <Nfc className="h-6 w-6 mr-2" />
                    NFC Scanning Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Testing Mode Alert */}
                  <Alert className="border-2 border-orange-500 bg-orange-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-orange-700">
                      <strong>Testing Mode:</strong> All scans go to Slot 99 (anytime scanning enabled)
                    </AlertDescription>
                  </Alert>

                  {/* Scan Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded border">
                      <div className="text-2xl font-bold text-blue-600">{scanCount}</div>
                      <div className="text-sm text-blue-600">Total Scans</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded border">
                      <div className="text-2xl font-bold text-green-600">
                        {scanResults.filter((r) => r.status === "success").length}
                      </div>
                      <div className="text-sm text-green-600">Successful ODs</div>
                    </div>
                  </div>

                  {/* NFC Controls */}
                  <div className="space-y-4">
                    {!isScanning ? (
                      <Button
                        onClick={startNFCScanning}
                        disabled={loading}
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {loading ? "Starting..." : "Start NFC Scanning"}
                      </Button>
                    ) : (
                      <Button onClick={stopNFCScanning} className="w-full bg-red-600 text-white hover:bg-red-700">
                        <Square className="h-4 w-4 mr-2" />
                        Stop NFC Scanning
                      </Button>
                    )}

                    {isScanning && (
                      <div className="flex items-center justify-center p-4 bg-blue-50 rounded border-2 border-blue-200">
                        <div className="animate-pulse flex items-center">
                          <Zap className="h-6 w-6 text-blue-600 mr-2" />
                          <span className="text-blue-600 font-medium">NFC Active - Hold cards near device</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Entry */}
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-black mb-2">Manual Entry (Backup)</h4>
                    <form onSubmit={handleManualEntry} className="space-y-2">
                      <Input
                        value={manualRollNumber}
                        onChange={(e) => setManualRollNumber(e.target.value.toUpperCase())}
                        placeholder="CB.SC.U4CSE24124"
                        className="border-2 border-gray-300 focus:border-black"
                      />
                      <Button
                        type="submit"
                        disabled={loading || !manualRollNumber.trim()}
                        className="w-full bg-black text-white hover:bg-gray-800"
                      >
                        Add Manual Entry
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {/* Scan Results */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <Users className="h-6 w-6 mr-2" />
                    Recent Scans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {scanResults.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Nfc className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No scans yet</p>
                        <p className="text-sm">Start scanning to see results here</p>
                      </div>
                    ) : (
                      scanResults.map((result, index) => (
                        <div
                          key={`${result.rollNumber}-${result.timestamp}-${index}`}
                          className={`p-3 rounded border-2 ${index === 0 ? "ring-2 ring-blue-500" : ""} ${
                            result.status === "success"
                              ? "border-green-200 bg-green-50"
                              : result.status === "duplicate"
                                ? "border-yellow-200 bg-yellow-50"
                                : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-sm">{result.rollNumber}</div>
                              <div className="text-sm text-gray-600">{result.studentName}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(result.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                            <Badge
                              variant={
                                result.status === "success"
                                  ? "default"
                                  : result.status === "duplicate"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {result.status}
                            </Badge>
                          </div>
                          <div className="text-xs mt-1 text-gray-600">{result.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NFC Write Tab */}
          <TabsContent value="nfc-write" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Write Controls */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <Edit3 className="h-6 w-6 mr-2" />
                    NFC Write to ID Cards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Info Alert */}
                  <Alert className="border-2 border-blue-500 bg-blue-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-blue-700">
                      <strong>Initialize ID Cards:</strong> Write roll numbers to blank university ID cards for
                      first-time setup
                    </AlertDescription>
                  </Alert>

                  {/* Write Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="write-roll">Roll Number to Write</Label>
                      <Input
                        id="write-roll"
                        value={writeRollNumber}
                        onChange={(e) => setWriteRollNumber(e.target.value.toUpperCase())}
                        placeholder="CB.SC.U4CSE24124"
                        className="border-2 border-gray-300 focus:border-black"
                      />
                    </div>

                    <Button
                      onClick={handleNFCWrite}
                      disabled={loading || !writeRollNumber.trim() || isWriting}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {isWriting ? "Writing..." : "Write to NFC Card"}
                    </Button>

                    {isWriting && (
                      <div className="flex items-center justify-center p-4 bg-purple-50 rounded border-2 border-purple-200">
                        <div className="animate-pulse flex items-center">
                          <Edit3 className="h-6 w-6 text-purple-600 mr-2" />
                          <span className="text-purple-600 font-medium">Hold blank card near device...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Write Instructions */}
                  <div className="bg-gray-50 p-4 rounded border">
                    <h4 className="font-bold text-black mb-2">📝 How to Write:</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Enter the student's roll number above</li>
                      <li>Click "Write to NFC Card"</li>
                      <li>Hold the blank ID card near your device</li>
                      <li>Wait for success confirmation</li>
                      <li>Card is now ready for future OD scanning</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Write History */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black flex items-center">
                    <CheckCircle className="h-6 w-6 mr-2" />
                    Write History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {writeResults.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Edit3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No writes yet</p>
                        <p className="text-sm">Write operations will appear here</p>
                      </div>
                    ) : (
                      writeResults.map((result, index) => (
                        <div
                          key={`${result.rollNumber}-${result.timestamp}-${index}`}
                          className={`p-3 rounded border-2 ${
                            result.status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-sm">{result.rollNumber}</div>
                              <div className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</div>
                            </div>
                            <Badge variant={result.status === "success" ? "default" : "destructive"}>
                              {result.status}
                            </Badge>
                          </div>
                          <div className="text-xs mt-1 text-gray-600">{result.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
