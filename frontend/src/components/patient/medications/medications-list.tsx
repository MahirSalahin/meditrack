import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMedicationsList } from "@/lib/api/services/patient/medications.service"
import { MedicationItem } from "@/types/medication"
import React from "react"

function getMedicationStatus(startDate?: string, duration?: string): "past" | "current" | "upcoming" | "unknown" {
    if (!startDate || !duration) return "unknown"
    const start = new Date(startDate)
    const daysMatch = duration.match(/(\d+)/)
    if (!daysMatch) return "unknown"
    const days = parseInt(daysMatch[1], 10)
    if (isNaN(days)) return "unknown"
    const end = new Date(start)
    end.setDate(start.getDate() + days - 1)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (today < start) return "upcoming"
    if (today > end) return "past"
    return "current"
}

function statusColor(status: string) {
    switch (status) {
        case "current": return "bg-green-100 text-green-800"
        case "past": return "bg-gray-100 text-gray-600"
        case "upcoming": return "bg-blue-100 text-blue-800"
        default: return "bg-yellow-100 text-yellow-800"
    }
}

export function MedicationsList() {
    const { data, isLoading, error } = useMedicationsList()
    const medications = data?.medications || []

    if (error) {
        return <div>Error loading medications</div>
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!medications.length) return <div>No medications found.</div>

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">My Medications</h2>
            {medications.map((med: MedicationItem, idx: number) => {
                const status = getMedicationStatus(med.prescribed_date, med.duration)
                return (
                    <Card key={med.id}>
                        <CardContent className="py-3 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{idx + 1}.</span>
                                <span>{med.medication_name}</span>
                                <Badge>{med.dosage}</Badge>
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${statusColor(status)}`}>{status}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {med.frequency} | Qty: {med.quantity} | Duration: {med.duration} | {med.instructions}
                            </div>
                            {med.doctor && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Prescribed by: {med.doctor.name} {med.doctor.specialization && `(${med.doctor.specialization})`}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
} 