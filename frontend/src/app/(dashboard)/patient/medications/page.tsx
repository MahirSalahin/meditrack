"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { QuickActions } from "@/components/patient/medications/quick-actions"
import { MedicationsList } from "@/components/patient/medications/medications-list"
import { MedicationSidebar } from "@/components/patient/medications/medication-sidebar"
import TitleHeader from "@/components/title-header"

export default function MedicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader
          title="My Medications"
          description="Manage your prescriptions and medication schedule"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Medications List */}
        <div className="lg:col-span-2">
          <MedicationsList />
        </div>

        {/* Sidebar */}
        <div>
          <MedicationSidebar />
        </div>
      </div>
    </div>
  )
}
