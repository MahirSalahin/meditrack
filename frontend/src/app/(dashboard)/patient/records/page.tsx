"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Search, Plus, Filter } from "lucide-react"
import { RecordCategories } from "@/components/patient/records/record-categories"
import { RecordList } from "@/components/patient/records/record-list"
import TitleHeader from "@/components/title-header"

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader title="Medical Records" description="Access and manage your complete medical history" />
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Record
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Categories */}
      <RecordCategories
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search medical records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filter
        </Button>
      </div>

      {/* Records List */}
      <RecordList
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
      />
    </div>
  )
}
