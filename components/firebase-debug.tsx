"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export function FirebaseDebug() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [collections, setCollections] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    checkFirebaseConnection()
  }, [])

  const checkFirebaseConnection = async () => {
    try {
      // Test Firestore connection
      const testCollection = collection(db, "test")
      await getDocs(testCollection)

      // Check if collections exist
      const collectionsToCheck = ["users", "students", "studentcoordinator", "ODs"]
      const existingCollections: string[] = []

      for (const collectionName of collectionsToCheck) {
        try {
          const snapshot = await getDocs(collection(db, collectionName))
          existingCollections.push(`${collectionName} (${snapshot.size} docs)`)
        } catch (err) {
          existingCollections.push(`${collectionName} (empty or error)`)
        }
      }

      setCollections(existingCollections)
      setConnectionStatus("connected")
    } catch (err: any) {
      setError(err.message)
      setConnectionStatus("error")
    }
  }

  return (
    <Card className="border-2 border-black">
      <CardHeader className="border-b-2 border-black bg-gray-50">
        <CardTitle className="text-black flex items-center gap-2">
          <Database className="h-5 w-5" />
          Firebase Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {connectionStatus === "checking" && (
          <Alert className="border-blue-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-blue-600">Checking Firebase connection...</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "connected" && (
          <Alert className="border-green-600">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-600">Firebase connected successfully!</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "error" && (
          <Alert className="border-red-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-600">Firebase connection error: {error}</AlertDescription>
          </Alert>
        )}

        {collections.length > 0 && (
          <div>
            <h4 className="font-bold text-black mb-2">Collections Status:</h4>
            <ul className="space-y-1 text-sm">
              {collections.map((collection, index) => (
                <li key={index} className="text-gray-600">
                  • {collection}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={checkFirebaseConnection} className="w-full bg-black text-white hover:bg-gray-800">
          Refresh Connection Status
        </Button>
      </CardContent>
    </Card>
  )
}
