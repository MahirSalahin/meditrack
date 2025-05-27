"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search } from "lucide-react"
import { PrescriptionStats } from "@/components/patient/prescriptions/prescription-stats"
import { PrescriptionList } from "@/components/patient/prescriptions/prescription-list"
import TitleHeader from "@/components/title-header"

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>()

  const categories = [
    { label: "All", value: undefined },
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Expired", value: "expired" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <TitleHeader
          title="Prescriptions"
          description="Manage your prescriptions and medication history"
        />
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Stats Cards */}
      <PrescriptionStats />

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category.value || "all"}
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Prescriptions List */}
      <PrescriptionList searchTerm={searchTerm} selectedCategory={selectedCategory} />
    </div>
  )
}
