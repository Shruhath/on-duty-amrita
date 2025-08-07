"use client"

import type React from "react"
import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, UserPlus, Shield, User, Mail, Copy } from "lucide-react"

interface UserTemplate {
  email: string
  name: string
  role: string
  department: string
  rollNumber?: string
}

const userTemplates: UserTemplate[] = [
  {
    email: "admin@college.edu",
    name: "System Administrator",
    role: "admin",
    department: "Administration",
  },
  {
    email: "teacher@college.edu",
    name: "Dr. Rajesh Kumar",
    role: "teacher",
    department: "Computer Science",
  },
  {
    email: "coord@college.edu",
    name: "Priya Sharma",
    role: "studentcord",
    department: "Computer Science",
    rollNumber: "21CS001",
  },
]

export function UserSetupHelper() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "admin",
  })
  const [selectedTemplate, setSelectedTemplate] = useState<UserTemplate | null>(null)
  const [uid, setUid] = useState("")
  const [department, setDepartment] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [copied, setCopied] = useState("")

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  const handleTemplateSelect = (template: UserTemplate) => {
    setSelectedTemplate(template)
    setUserForm({
      email: template.email,
      password: template.role + "123",
      name: template.name,
      role: template.role,
    })
    setDepartment(template.department)
    setRollNumber(template.rollNumber || "")
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userForm.email, userForm.password)

      // Add user data to Firestore
      const userData: any = {
        uid: userCredential.user.uid,
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        department,
        createdAt: new Date().toISOString(),
      }

      // Add rollNumber for student coordinators
      if (userForm.role === "studentcord" && rollNumber) {
        userData.rollNumber = rollNumber
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData)

      showMessage("success", `User ${userForm.name} created successfully!`)
      setUserForm({
        email: "",
        password: "",
        name: "",
        role: "admin",
      })
      setUid("")
      setDepartment("")
      setRollNumber("")
      setSelectedTemplate(null)
    } catch (error: any) {
      showMessage("error", `Error creating user: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Admin User Creation Form */}
        <Card className="border-2 border-black">
          <CardHeader className="border-b-2 border-black bg-gray-50">
            <CardTitle className="text-black flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create Admin User
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {message.text && (
              <Alert className={`mb-4 border-2 ${message.type === "success" ? "border-green-600" : "border-red-600"}`}>
                {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription className={message.type === "success" ? "text-green-600" : "text-red-600"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="border-2 border-gray-300 focus:border-black"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="border-2 border-gray-300 focus:border-black"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="border-2 border-gray-300 focus:border-black"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
                {loading ? "Creating User..." : "Create Admin User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Templates */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-black text-center">User Setup Helper</CardTitle>
            <p className="text-gray-600 text-center">
              Create user documents for all roles (Admin, Teacher, Coordinator)
            </p>
          </CardHeader>
          <CardContent>
            {message.text && (
              <Alert className={`mb-4 border-2 ${message.type === "success" ? "border-green-600" : "border-red-600"}`}>
                {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription className={message.type === "success" ? "text-green-600" : "text-red-600"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-black mb-4">Quick Setup Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userTemplates.map((template, index) => (
                  <Card
                    key={index}
                    className={`border-2 cursor-pointer transition-colors ${
                      selectedTemplate?.email === template.email
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {template.role === "admin" && <Shield className="h-5 w-5 text-black" />}
                        {template.role === "teacher" && <User className="h-5 w-5 text-black" />}
                        {template.role === "studentcord" && <Mail className="h-5 w-5 text-black" />}
                        <span className="font-bold text-black capitalize">{template.role}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Name:</strong> {template.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Email:</strong> {template.email}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Dept:</strong> {template.department}
                      </p>
                      {template.rollNumber && (
                        <p className="text-sm text-gray-600">
                          <strong>Roll:</strong> {template.rollNumber}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="uid">User UID (from Firebase Auth)</Label>
                <Input
                  id="uid"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="Copy from Firebase Console → Authentication → Users"
                  className="border-2 border-gray-300 focus:border-black"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Go to Firebase Console → Authentication → Users → Find your user → Copy UID
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="border-2 border-gray-300 focus:border-black"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="border-2 border-gray-300 focus:border-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="border-2 border-gray-300 focus:border-black"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="border-2 border-gray-300 focus:border-black"
                    required
                  />
                </div>
              </div>

              {userForm.role === "studentcord" && (
                <div>
                  <Label htmlFor="rollNumber">Roll Number (for Student Coordinator)</Label>
                  <Input
                    id="rollNumber"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., 21CS001"
                    className="border-2 border-gray-300 focus:border-black"
                  />
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
                {loading ? "Creating..." : "Create User Document"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Firebase Auth Setup Instructions */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Step 1: Create Firebase Auth Users</CardTitle>
            <p className="text-gray-600">First, create these users in Firebase Authentication</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTemplates.map((template, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-black capitalize">{template.role} User</h4>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(template.email, `email-${index}`)}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        {copied === `email-${index}` ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Email:</strong> {template.email}
                    </div>
                    <div>
                      <strong>Password:</strong> {template.role}123
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Alert className="mt-4 border-2 border-blue-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-blue-600">
                <strong>Instructions:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Go to Firebase Console → Authentication → Users</li>
                  <li>Click "Add user" for each role above</li>
                  <li>Use the email and password shown</li>
                  <li>Copy the generated UID for each user</li>
                  <li>Use the form above to create the Firestore user documents</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Manual Firestore Setup */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Step 2: Manual Firestore Setup (Alternative)</CardTitle>
            <p className="text-gray-600">If the form above doesn't work, create these documents manually</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTemplates.map((template, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-black capitalize">{template.role} Document</h4>
                    <Button
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(
                            {
                              ...template,
                              createdAt: new Date().toISOString(),
                            },
                            null,
                            2,
                          ),
                          `json-${index}`,
                        )
                      }
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {copied === `json-${index}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm mb-2">
                      <strong>Collection:</strong> users
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Document ID:</strong> [USER_UID_FROM_AUTH]
                    </p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(
                        {
                          ...template,
                          createdAt: new Date().toISOString(),
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
