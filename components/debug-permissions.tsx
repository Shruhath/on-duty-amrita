"use client"

import { useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, AlertCircle, User } from "lucide-react"

export function DebugPermissions() {
  const { userData } = useAuth()
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testPermissions = async () => {
    setLoading(true)
    const results = {
      userRole: userData?.role || "unknown",
      permissions: {
        readUsers: false,
        readStudents: false,
        readODs: false,
        readScanLogs: false,
      },
      errors: [] as string[],
    }

    try {
      // Test reading users collection
      try {
        await getDoc(doc(db, "users", userData?.uid || "test"))
        results.permissions.readUsers = true
      } catch (error: any) {
        results.errors.push(`Users: ${error.message}`)
      }

      // Test reading students collection
      try {
        await getDoc(doc(db, "students", "CB.SC.U4CSE24124"))
        results.permissions.readStudents = true
      } catch (error: any) {
        results.errors.push(`Students: ${error.message}`)
      }

      // Test reading ODs collection
      try {
        await getDoc(doc(db, "ODs", "CB.SC.U4CSE24124"))
        results.permissions.readODs = true
      } catch (error: any) {
        results.errors.push(`ODs: ${error.message}`)
      }

      // Test reading scan_logs collection
      try {
        await getDoc(doc(db, "scan_logs", "test"))
        results.permissions.readScanLogs = true
      } catch (error: any) {
        results.errors.push(`Scan Logs: ${error.message}`)
      }
    } catch (error: any) {
      results.errors.push(`General error: ${error.message}`)
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <Card className="border-2 border-black">
      <CardHeader className="border-b-2 border-black bg-gray-50">
        <CardTitle className="text-black flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permission Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="bg-blue-50 p-4 rounded border">
          <h4 className="font-bold text-blue-800 mb-2">Current User:</h4>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{userData?.name || "Unknown"}</span>
            <Badge variant="outline">{userData?.role || "No Role"}</Badge>
          </div>
        </div>

        <Button onClick={testPermissions} disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
          {loading ? "Testing Permissions..." : "Test My Permissions"}
        </Button>

        {testResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-bold text-black">Permissions:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {testResults.permissions.readUsers ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Read Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.permissions.readStudents ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Read Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.permissions.readODs ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Read ODs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.permissions.readScanLogs ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Read Scan Logs</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-black">Role: {testResults.userRole}</h4>
                {testResults.userRole === "teacher" && !testResults.permissions.readODs && (
                  <Alert className="border-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-600 text-xs">
                      Teachers need OD read permission! Update Firestore rules.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {testResults.errors.length > 0 && (
              <div>
                <h4 className="font-bold text-red-600 mb-2">Errors:</h4>
                <div className="space-y-1">
                  {testResults.errors.map((error: string, index: number) => (
                    <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
