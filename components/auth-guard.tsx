"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSkeleton } from "./loading-skeleton"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Array<"admin" | "teacher" | "coordinator" | "student">
  redirectTo?: string
}

export function AuthGuard({ children, allowedRoles, redirectTo = "/" }: AuthGuardProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/")
        return
      }

      if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
        // Redirect based on user role
        switch (userData.role) {
          case "admin":
            router.push("/admin")
            break
          case "teacher":
            router.push("/teacher")
            break
          case "coordinator":
          case "studentcord": // Handle both role names
            router.push("/cord")
            break
          case "student":
            router.push("/student")
            break
          default:
            router.push("/")
        }
        return
      }
    }
  }, [user, userData, loading, router, allowedRoles])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!user) {
    return null
  }

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    return null
  }

  return <>{children}</>
}
