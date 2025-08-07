"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Info } from "lucide-react"

export function ManualSetupGuide() {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader className="border-b-2 border-black bg-gray-50">
          <CardTitle className="text-black">Roll Number Format Guide</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Alert className="border-blue-600">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-600">
              Understanding the roll number format: CB.SC.U4CSE24124
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
              <div>
                <strong>CB</strong> - Campus (Coimbatore)
              </div>
              <div>
                <strong>SC</strong> - School (School of Computing)
              </div>
              <div>
                <strong>U4</strong> - Programme (Undergrad 4-year)
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
              <div>
                <strong>CSE</strong> - Department (Computer Science)
              </div>
              <div>
                <strong>24</strong> - Year (2024)
              </div>
              <div>
                <strong>1</strong> - Section (B section)
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 p-3 bg-gray-50 rounded">
              <div>
                <strong>24</strong> - Class Roll Number
              </div>
            </div>
          </div>

          <Alert className="border-green-600">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-600">
              Email is auto-generated: cb.sc.u4cse24124@cb.students.amrita.edu
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="border-2 border-black">
        <CardHeader className="border-b-2 border-black bg-gray-50">
          <CardTitle className="text-black">Section Mapping</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Section A:</span>
                <span>3rd digit = 0</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Section B:</span>
                <span>3rd digit = 1</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Section C:</span>
                <span>3rd digit = 2</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Section D:</span>
                <span>3rd digit = 3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
