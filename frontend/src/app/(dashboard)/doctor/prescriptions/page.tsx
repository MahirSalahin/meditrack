"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText } from "lucide-react"
import { useDoctorPrescriptions } from "@/lib/api/services/doctor/prescriptions.service"
import TitleHeader from "@/components/title-header"

export default function DoctorPrescriptionsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const { data: prescriptions, isLoading } = useDoctorPrescriptions()

    return (
        <div className="container mx-auto px-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <TitleHeader
                    title="Prescriptions"
                    description="Manage patient prescriptions and medication orders"
                />
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Prescription
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search by patient name or medication..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Prescriptions List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    prescriptions?.map((prescription) => (
                        <Card key={prescription.id} className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">{prescription.patientName}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {prescription.medication} - {prescription.dosage}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Prescribed: {prescription.prescribedDate}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm">
                                            <FileText className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}