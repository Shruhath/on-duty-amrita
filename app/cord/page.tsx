"use client"

import { AuthGuard } from "@/components/auth-guard"
import { StudentCoordinatorPanel } from "@/components/student-coordinator-panel"

export default function CoordinatorPage() {
  return (
    <AuthGuard requiredRole="coordinator">
      <StudentCoordinatorPanel />
    </AuthGuard>
  )
}
