import { wait } from "@/lib/wait"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface DoctorPrescription {
    id: string
    patientId: string
    patientName: string
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
}

export interface CreatePrescriptionData {
    patientId: string
    medication: string
    dosage: string
    frequency: string
    quantity: string
    instructions: string
    diagnosis: string
    refills: number
    validUntil: string
}

const getDoctorPrescriptionsData = async (): Promise<DoctorPrescription[]> => {
    await wait(700)
    return [
        {
            id: "DP001",
            patientId: "PAT001",
            patientName: "John Smith",
            medication: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            quantity: "30 tablets",
            prescribedDate: "2024-01-15",
            validUntil: "2024-07-15",
            status: "active",
            diagnosis: "Hypertension",
            instructions: "Take with or without food",
            refillsRemaining: 3
        },
        // Add more mock data
    ]
}

const createPrescription = async (data: CreatePrescriptionData): Promise<DoctorPrescription> => {
    await wait(1000)
    return {
        id: `DP${Date.now()}`,
        patientId: data.patientId,
        patientName: "Patient Name", // This would come from patient lookup
        medication: data.medication,
        dosage: data.dosage,
        frequency: data.frequency,
        quantity: data.quantity,
        prescribedDate: new Date().toISOString().split('T')[0],
        validUntil: data.validUntil,
        status: "active",
        diagnosis: data.diagnosis,
        instructions: data.instructions,
        refillsRemaining: data.refills
    }
}

export const useDoctorPrescriptions = () => {
    return useQuery({
        queryKey: ["doctor-prescriptions"],
        queryFn: getDoctorPrescriptionsData
    })
}

export const useCreatePrescription = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createPrescription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] })
        }
    })
}