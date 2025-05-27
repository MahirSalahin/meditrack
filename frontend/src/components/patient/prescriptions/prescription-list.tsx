import { usePrescriptionsList } from "@/lib/api/services/patient/prescription.service"
import { PrescriptionCard } from "./prescription-card"
import { PrescriptionListSkeleton } from "@/components/skeletons/patient/prescription.skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface PrescriptionListProps {
    searchTerm: string
    selectedCategory?: string
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
                <AlertDescription>
                    Failed to load prescriptions. Please try again later.
                </AlertDescription>
            </Alert>
        )
    }

    if (!prescriptions?.length) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    No prescriptions found. Please check back later.
                </AlertDescription>
            </Alert>
        )
    }

    const filteredPrescriptions = prescriptions.filter((prescription) => {
        const matchesSearch = searchTerm
            ? prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
            : true

        const matchesCategory = selectedCategory
            ? prescription.status === selectedCategory.toLowerCase()
            : true

        return matchesSearch && matchesCategory
    })

    if (!filteredPrescriptions.length) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    No prescriptions match your search criteria.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))}
        </div>
    )
} 