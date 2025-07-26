"use client"

import {
  usePrescriptionsList
} from "@/lib/api/prescription.service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { PrescriptionCard } from "./prescription-card"
import { PrescriptionStatus } from "@/types/prescription"

interface PrescriptionListProps {
  searchTerm: string
  selectedCategory?: PrescriptionStatus
}

export function PrescriptionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PrescriptionList({ searchTerm, selectedCategory }: PrescriptionListProps) {
  const { data: prescriptions, isLoading, error } = usePrescriptionsList()

  if (isLoading) {
    return <PrescriptionListSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load prescriptions. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  if (!prescriptions?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No prescriptions found</h3>
        <p className="text-muted-foreground">Upload your first prescription PDF to get started.</p>
      </div>
    )
  }

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = searchTerm
      ? prescription.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesCategory = selectedCategory ? prescription.status === selectedCategory : true

    return matchesSearch && matchesCategory
  })

  if (!filteredPrescriptions.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No prescriptions match your search criteria.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">
        {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? "s" : ""}
      </div>
      {filteredPrescriptions.map((prescription) => (
        <PrescriptionCard key={prescription.id} prescription={prescription} />
      ))}
    </div>
  )
}
