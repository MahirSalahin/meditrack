import { wait } from "@/lib/wait"
import { useQuery } from "@tanstack/react-query"

export interface PatientPrescription {
    id: string
    doctorId: string
    doctorName: string
    medication: string
    dosage: string
    frequency: string
    quantity: string
    prescribedDate: string
    validUntil: string
    status: "active" | "pending" | "completed" | "expired"
    diagnosis: string
    instructions: string
    refillsRemaining: number
    totalRefills: number
}

const getPatientPrescriptionsData = async (): Promise<PatientPrescription[]> => {
    await wait(600)
    return [
        {
            id: "PP001",
            doctorId: "DOC001",
            doctorName: "Sarah Johnson",
            medication: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            quantity: "30 tablets",
            prescribedDate: "2024-01-15",
            validUntil: "2024-07-15",
            status: "active",
            diagnosis: "Hypertension",
            instructions: "Take with or without food, preferably at the same time each day",
            refillsRemaining: 3,
            totalRefills: 5
        },
        {
            id: "PP002",
            doctorId: "DOC002",
            doctorName: "Michael Chen",
            medication: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily",
            quantity: "60 tablets",
            prescribedDate: "2024-01-20",
            validUntil: "2024-07-20",
            status: "active",
            diagnosis: "Type 2 Diabetes",
            instructions: "Take with meals to reduce stomach upset",
            refillsRemaining: 2,
            totalRefills: 3
        },
        {
            id: "PP003",
            doctorId: "DOC001",
            doctorName: "Sarah Johnson",
            medication: "Amoxicillin",
            dosage: "250mg",
            frequency: "Three times daily",
            quantity: "21 capsules",
            prescribedDate: "2024-01-10",
            validUntil: "2024-01-17",
            status: "completed",
            diagnosis: "Bacterial Infection",
            instructions: "Complete the full course even if feeling better",
            refillsRemaining: 0,
            totalRefills: 0
        },
        {
            id: "PP004",
            doctorId: "DOC003",
            doctorName: "Emily Davis",
            medication: "Vitamin D3",
            dosage: "1000 IU",
            frequency: "Once daily",
            quantity: "90 tablets",
            prescribedDate: "2024-01-22",
            validUntil: "2024-04-22",
            status: "active",
            diagnosis: "Vitamin D Deficiency",
            instructions: "Take with a meal containing fat for better absorption",
            refillsRemaining: 1,
            totalRefills: 1
        }
    ]
}

export const usePatientPrescriptions = () => {
    return useQuery({
        queryKey: ["patient-prescriptions"],
        queryFn: getPatientPrescriptionsData
    })
}