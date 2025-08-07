"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Copy } from "lucide-react"

export function AdminSetupHelper() {
  const [copied, setCopied] = useState(false)

  const sampleData = `CB.SC.U4CSE24124,John Doe
CB.SC.U4CSE24025,Jane Smith
CB.SC.U4CSE24201,Alice Johnson
CB.SC.U4ECE24156,Bob Wilson
CB.SC.U4EEE24089,Carol Brown`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader className="border-b-2 border-black bg-gray-50">
          <CardTitle className="text-black">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Alert className="border-blue-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-blue-600">
              Follow these steps to set up your OD Manager system
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>1. Upload student data using CSV format</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>2. Assign student coordinators for events</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>3. Create OD entries for students</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-black">
        <CardHeader className="border-b-2 border-black bg-gray-50">
          <CardTitle className="text-black">Sample CSV Data</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gray-100 p-4 rounded border font-mono text-sm">
            <pre>{sampleData}</pre>
          </div>
          <Button onClick={copyToClipboard} className="mt-4 bg-black text-white hover:bg-gray-800">
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy Sample Data"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
