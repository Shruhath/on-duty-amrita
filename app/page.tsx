"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login, userData } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  if (userData) {
    switch (userData.role) {
      case "admin":
        router.push("/admin")
        break
      case "teacher":
        router.push("/teacher")
        break
      case "coordinator":
      case "studentcord": // Handle both coordinator role names
        router.push("/cord")
        break
      default:
        router.push("/student")
    }
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
    } catch (error: any) {
      setError(error.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="text-center border-b-2 border-black bg-gray-50">
          <CardTitle className="text-2xl font-bold text-black flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            OD Manager Login
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert className="mb-4 border-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-black font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-black focus:border-gray-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-black font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-black focus:border-gray-600"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
