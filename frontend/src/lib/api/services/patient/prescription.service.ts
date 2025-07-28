import axiosInstance from "@/lib/axios-interceptor"
import { Prescription, PrescriptionStats, PrescriptionRefill } from "./types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const getPrescriptionStatsData = async (): Promise<PrescriptionStats> => {
    try {
        const response = await axiosInstance.get("/prescriptions/my/stats")
        const stats = response.data
        
        return {
            active: stats.active || 0,
            pending: stats.draft || 0,
            totalRefills: stats.medication_logs_count || 0,
            total: stats.total_prescriptions || 0,
            adherenceRate: "95%", // TODO: Calculate adherence rate from backend data
            nextRefillDue: "2024-03-15", // TODO: Get from backend
            recentRefills: Math.floor((stats.medication_logs_count || 0) / 5) // Estimate
        }
    } catch (error) {
        console.error("Error fetching prescription stats:", error)
        // Fallback to default values
        return {
            active: 0,
            pending: 0,
            totalRefills: 0,
            total: 0,
            adherenceRate: "0%",
            nextRefillDue: "N/A",
            recentRefills: 0
        }
    }
}

const getPrescriptionsListData = async (): Promise<Prescription[]> => {
    try {
        const response = await axiosInstance.get("/prescriptions/my/list")
        const prescriptions = response.data?.prescriptions || []
        
        // Transform backend data to match frontend interface
        return prescriptions.map((prescription: any) => ({
            id: prescription.id,
            medication: prescription.diagnosis || "Medication", // Using diagnosis as closest match
            genericName: prescription.diagnosis || "Generic Name",
            dosage: "Dosage TBD", // Not available in current schema
            quantity: "Quantity TBD", // Not available in current schema
            frequency: "Frequency TBD", // Not available in current schema
            prescribedBy: `Dr. ${prescription.doctor_name || "Unknown"}`,
            prescribedDate: prescription.prescribed_date || prescription.created_at,
            validUntil: prescription.end_date || "N/A",
            status: prescription.status,
            refillsRemaining: 0, // Not available in current schema
            totalRefills: 0, // Not available in current schema
            pharmacy: "TBD", // Not available in current schema
            instructions: prescription.notes || "No instructions provided",
            diagnosis: prescription.diagnosis || "No diagnosis provided",
            ndc: "N/A", // Not available in current schema
            daw: false, // Not available in current schema
            sideEffects: [], // Not available in current schema
            contraindications: [], // Not available in current schema
            interactions: [], // Not available in current schema
            refillHistory: [], // Not available in current schema
            prescriptionHistory: [], // Not available in current schema
            lastFilledDate: undefined, // Not available in current schema
            nextRefillDate: "TBD", // Not available in current schema
            adherenceRate: "N/A", // Not available in current schema
            notes: prescription.notes || "No notes",
            attachments: [] // Not available in current schema
        }))
    } catch (error) {
        console.error("Error fetching prescriptions:", error)
        return []
    }
}

const requestRefill = async (prescriptionId: string): Promise<PrescriptionRefill> => {
    // TODO: Implement real API call for requesting prescription refill
    console.log(`Requesting refill for prescription ${prescriptionId}`)
    return {
        id: `RF${Date.now()}`,
        prescriptionId,
        requestedDate: new Date().toISOString(),
        status: "pending",
        pharmacy: "CVS Pharmacy"
    }
}

const downloadPrescription = async (prescriptionId: string): Promise<string> => {
    // Use the real API endpoint for downloading prescriptions
    try {
        const response = await axiosInstance.get(`/prescriptions/pdf/${prescriptionId}/view`)
        return response.data // This should be the download URL
    } catch (error) {
        console.error("Error downloading prescription:", error)
        return `/api/prescriptions/${prescriptionId}/download`
    }
}

interface SharePrescriptionParams {
    prescriptionId: string;
    doctorId: string;
}

const sharePrescription = async ({ prescriptionId, doctorId }: SharePrescriptionParams): Promise<void> => {
    // TODO: Implement real API call for sharing prescription with doctor
    console.log(`Sharing prescription ${prescriptionId} with doctor ${doctorId}`)
    // Implementation for sharing prescription with doctor
}

export const usePrescriptionStats = () => {
    return useQuery({
        queryKey: ["prescription-stats"],
        queryFn: getPrescriptionStatsData,
    })
}

export const usePrescriptionsList = () => {
    return useQuery({
        queryKey: ["prescriptions-list"],
        queryFn: getPrescriptionsListData,
    })
}

export const useRequestRefill = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: requestRefill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prescriptions-list"] })
        },
    })
}

export const useDownloadPrescription = () => {
    return useMutation({
        mutationFn: downloadPrescription,
    })
}

export const useSharePrescription = () => {
    return useMutation({
        mutationFn: sharePrescription,
    })
}

