"use client"

import { AuthGuard } from "@/components/auth-guard"
import { TeacherPanel } from "@/components/teacher-panel"

export default function TeacherPage() {
  return (
    <AuthGuard requiredRole="teacher">
      <TeacherPanel />
    </AuthGuard>
  )
}
