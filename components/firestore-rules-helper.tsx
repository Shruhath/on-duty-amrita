"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, CheckCircle, AlertTriangle } from "lucide-react"

export function FirestoreRulesHelper() {
  const [copied, setCopied] = useState(false)

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isTeacher() {
      return isAuthenticated() && getUserData().role == 'teacher';
    }
    
    function isCoordinator() {
      return isAuthenticated() && getUserData().role == 'coordinator';
    }
    
    function isStudent() {
      return isAuthenticated() && getUserData().role == 'student';
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Students collection
    match /students/{rollNumber} {
      allow read: if isAuthenticated() && (isAdmin() || isTeacher());
      allow write: if isAdmin();
    }
    
    // Student coordinators
    match /studentcoordinator/{docId} {
      allow read: if isAuthenticated() && (isAdmin() || isCoordinator());
      allow write: if isAdmin();
    }
    
    // OD entries - FIXED FOR TEACHER ACCESS
    match /ODs/{rollNumber} {
      allow read, write: if isAdmin();
      allow read: if isTeacher();  // Teachers can now read all OD records
      allow read, write: if isCoordinator();
      allow read: if isStudent() && getUserData().rollNumber == rollNumber;
    }
    
    // Scan logs
    match /scan_logs/{scanId} {
      allow read: if isAuthenticated() && (isAdmin() || isTeacher() || isCoordinator());
      allow write: if isAuthenticated() && (isAdmin() || isCoordinator());
    }
    
    // Events
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Departments
    match /departments/{departmentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Time slots
    match /time_slots/{timeSlotId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}`

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRules)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-2 border-black">
      <CardHeader className="border-b-2 border-black bg-gray-50">
        <CardTitle className="text-black">🔧 UPDATED Firestore Security Rules</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-red-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-600">
            <strong>IMPORTANT:</strong> Your current Firestore rules don't allow teachers to read OD records. Copy these
            updated rules to Firebase Console → Firestore Database → Rules
          </AlertDescription>
        </Alert>

        <div className="bg-green-50 p-4 rounded border-2 border-green-200">
          <h4 className="font-bold text-green-800 mb-2">✅ What's Fixed:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Teachers can now read ALL OD records (for attendance checking)</li>
            <li>• Added helper functions for cleaner rule logic</li>
            <li>• Maintained security - teachers still can't write OD records</li>
            <li>• Students can only see their own OD records</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded border font-mono text-xs overflow-x-auto">
          <pre>{firestoreRules}</pre>
        </div>

        <Button onClick={copyRules} className="w-full bg-black text-white hover:bg-gray-800">
          <Copy className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy Updated Firestore Rules"}
        </Button>

        {copied && (
          <Alert className="border-green-600">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-600">
              Rules copied! Now paste them in Firebase Console and click "Publish".
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
