"use client"

import { Button } from "@/components/ui/button"
import {
    FileText,
    Pill,
    Clock,
} from "lucide-react"
import AddPrescriptionDialog from "./add-prescription-dialog"
import { PatientProfileForDoctor } from "@/types"
import { useState } from "react"
import { usePrescriptionsListByPatientId } from "@/lib/api/prescription.service"
import { PrescriptionCard } from "@/components/patient/prescriptions/prescription-card"
import { PrescriptionListSkeleton } from "@/components/patient/prescriptions/prescription-list"
import { PrescriptionStatus } from "@/types/prescription"

interface PatientPrescriptionsProps {
    patient: PatientProfileForDoctor
}

const statusOptions: { label: string; value?: PrescriptionStatus }[] = [
    { label: "All", value: undefined },
    { label: "Active", value: PrescriptionStatus.ACTIVE },
    { label: "Draft", value: PrescriptionStatus.DRAFT },
    { label: "Completed", value: PrescriptionStatus.COMPLETED },
    { label: "Expired", value: "expired" as PrescriptionStatus }, // Assuming "expired" is a valid status
    { label: "Discontinued", value: PrescriptionStatus.DISCONTINUED },
]

export default function PatientPrescriptions({ patient }: PatientPrescriptionsProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<PrescriptionStatus | string | undefined>(undefined)
    const [showOwn, setShowOwn] = useState(false)
    const { data:prescriptions, isLoading: loadingPrescriptions, error } = usePrescriptionsListByPatientId(patient.id)

    const filteredPrescriptions = prescriptions?.filter((prescription) => {
        const matchesSearch = searchTerm
            ? prescription.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.file_name.toLowerCase().includes(searchTerm.toLowerCase())
            : true
        const matchesStatus = selectedStatus ? prescription.status === selectedStatus : true
        const matchesOwn = showOwn ? prescription.own_prescription : true
        return matchesSearch && matchesStatus && matchesOwn
    }) ?? []

    return (
        <div className="space-y-6">
            {/* Header with Add Prescription */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Prescriptions</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage prescriptions for {patient.name}
                    </p>
                </div>
                <AddPrescriptionDialog
                    patient={patient}
                    trigger={
                        <Button>
                            <Pill className="h-4 w-4 mr-2" />
                            New Prescription
                        </Button>
                    }
                />
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-96">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search prescriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full border rounded-md py-2 px-3 text-sm"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    {statusOptions.map((option) => (
                        <Button
                            key={option.label}
                            variant={selectedStatus === option.value ? "default" : "outline"}
                            onClick={() => setSelectedStatus(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                    <Button
                        variant={showOwn ? "default" : "outline"}
                        onClick={() => setShowOwn((v) => !v)}
                    >
                        Own Prescriptions
                    </Button>
                </div>
            </div>

            {/* Loading/Empty/Error States */}
            {error && (
                <div className="text-center py-12 text-red-500">Failed to load prescriptions.</div>
            )}
            {!loadingPrescriptions && !filteredPrescriptions.length && (
                <div className="text-center py-12 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No prescriptions found</h3>
                    <p>No prescriptions match your search/filter criteria.</p>
                </div>
            )}

            {/* Prescription List */}
            {
                loadingPrescriptions ?
                    <PrescriptionListSkeleton /> :
                    <div className="space-y-3">
                        {filteredPrescriptions.map((prescription) => (
                            <PrescriptionCard
                                key={prescription.id}
                                prescription={prescription}
                            />
                        ))}
                    </div>
            }
        </div>
    )
} 