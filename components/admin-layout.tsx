"use client"

import type { ReactNode } from "react"

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Admin Panel" }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-black p-4">
        <h1 className="text-3xl font-bold text-black">{title}</h1>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
