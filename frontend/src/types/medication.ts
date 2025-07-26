export interface MedicationItem {
    id: string
    medication_name: string
    dosage: string
    frequency: string
    quantity: string
    duration?: string
    instructions?: string
    prescription_id: string
    prescribed_date?: string
    doctor?: {
        name?: string
        specialization?: string
    }
}

export interface MedicationsListResponse {
    medications: MedicationItem[]
    total: number
    limit: number
    offset: number
}

export interface MedicationsStatsResponse {
    activeMedications: number
    adherenceRate: string
    dosesThisWeek: number
    refillsNeeded: number
} 