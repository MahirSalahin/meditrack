"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Search } from "lucide-react"
import { RecordList } from "@/components/patient/records/record-list"
import TitleHeader from "@/components/title-header"
import { UploadRecordDialog } from "@/components/patient/records/upload-record-dialog"

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader title="Medical Records" description="Access and manage your complete medical history" />
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" />
          Upload Record
        </Button>
      </div>

      <UploadRecordDialog open={uploadOpen} onOpenChange={setUploadOpen} />

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
      </div>

      {/* Records List */}
      <RecordList
        searchTerm={searchTerm}
      />
    </div>
  )
}
