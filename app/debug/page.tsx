"use client"

import { FirebaseDebug } from "@/components/firebase-debug"
import { AdminSetupHelper } from "@/components/admin-setup-helper"
import { ManualSetupGuide } from "@/components/manual-setup-guide"
import { FirestoreRulesHelper } from "@/components/firestore-rules-helper"
import { DebugPermissions } from "@/components/debug-permissions"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold text-black">Firebase Debug & Setup</h1>
          <p className="text-gray-600">Debug Firebase connection and fix permission issues</p>
        </div>

        <FirebaseDebug />
        <DebugPermissions />
        <FirestoreRulesHelper />
        <AdminSetupHelper />
        <ManualSetupGuide />
      </div>
    </div>
  )
}
