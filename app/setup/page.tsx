"use client"

import { UserSetupHelper } from "@/components/user-setup-helper"
import { AdminSetupHelper } from "@/components/admin-setup-helper"
import { FirebaseDebug } from "@/components/firebase-debug"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold text-black">OD Manager Setup</h1>
          <p className="text-gray-600">Set up your OD Manager system</p>
        </div>

        <FirebaseDebug />
        <UserSetupHelper />
        <AdminSetupHelper />
      </div>
    </div>
  )
}
