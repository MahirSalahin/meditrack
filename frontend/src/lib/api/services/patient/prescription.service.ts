import { wait } from "@/lib/wait"
import { Prescription, PrescriptionStats, PrescriptionRefill } from "./types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const getPrescriptionStatsData = async (): Promise<PrescriptionStats> => {
    await wait(500)
    return {
        active: 2,
        pending: 1,
        totalRefills: 10,
        total: 4,
        adherenceRate: "95%",
        nextRefillDue: "2024-03-15",
        recentRefills: 2
    }
}

const getPrescriptionsListData = async (): Promise<Prescription[]> => {
    await wait(700)
    return [
        {
            id: "RX001",
            medication: "Lisinopril",
            genericName: "Lisinopril",
            dosage: "10mg",
            quantity: "30 tablets",
            frequency: "Once daily",
            prescribedBy: "Dr. Sarah Johnson",
            prescribedDate: "2024-01-15",
            validUntil: "2024-07-15",
            status: "active",
            refillsRemaining: 3,
            totalRefills: 5,
            pharmacy: "CVS Pharmacy",
            instructions: "Take with food. Monitor blood pressure regularly.",
            diagnosis: "Hypertension",
            ndc: "0071-0222-23",
            daw: false,
            sideEffects: ["Dizziness", "Headache", "Dry cough"],
            contraindications: ["Pregnancy", "Kidney disease"],
            interactions: ["NSAIDs", "Lithium"],
            refillHistory: [
                {
                    id: "RF001",
                    prescriptionId: "RX001",
                    requestedDate: "2024-02-15",
                    status: "completed",
                    processedDate: "2024-02-16",
                    pharmacy: "CVS Pharmacy"
                }
            ],
            prescriptionHistory: [
                {
                    id: "PH001",
                    prescriptionId: "RX001",
                    action: "filled",
                    date: "2024-01-15",
                    performedBy: "Dr. Sarah Johnson"
                }
            ],
            lastFilledDate: "2024-02-16",
            nextRefillDate: "2024-03-15",
            adherenceRate: "98%",
            notes: "Patient responding well to medication",
            attachments: [
                {
                    id: "ATT001",
                    name: "Prescription_Label.pdf",
                    type: "application/pdf",
                    url: "/attachments/RX001_label.pdf",
                    uploadedAt: "2024-01-15"
                }
            ]
        },
        {
            id: "RX002",
            medication: "Metformin HCl",
            genericName: "Metformin",
            dosage: "500mg",
            quantity: "60 tablets",
            frequency: "Twice daily with meals",
            prescribedBy: "Dr. Michael Chen",
            prescribedDate: "2023-12-20",
            validUntil: "2024-12-20",
            status: "active",
            refillsRemaining: 5,
            totalRefills: 6,
            pharmacy: "Walgreens",
            instructions: "Take with meals to reduce stomach upset. Monitor blood sugar.",
            diagnosis: "Type 2 Diabetes",
            ndc: "0093-1074-01",
            daw: false,
            sideEffects: ["Nausea", "Diarrhea", "Vitamin B12 deficiency"],
            contraindications: ["Kidney disease", "Heart failure"],
            interactions: ["Contrast dye", "Alcohol"],
            refillHistory: [
                {
                    id: "RF002",
                    prescriptionId: "RX002",
                    requestedDate: "2024-01-20",
                    status: "completed",
                    processedDate: "2024-01-21",
                    pharmacy: "Walgreens"
                }
            ],
            prescriptionHistory: [
                {
                    id: "PH002",
                    prescriptionId: "RX002",
                    action: "filled",
                    date: "2023-12-20",
                    performedBy: "Dr. Michael Chen"
                }
            ],
            lastFilledDate: "2024-01-21",
            nextRefillDate: "2024-02-20",
            adherenceRate: "92%",
            notes: "Patient reports mild GI symptoms",
            attachments: [
                {
                    id: "ATT002",
                    name: "Prescription_Label.pdf",
                    type: "application/pdf",
                    url: "/attachments/RX002_label.pdf",
                    uploadedAt: "2023-12-20"
                }
            ]
        },
        {
            id: "RX003",
            medication: "Atorvastatin",
            genericName: "Atorvastatin",
            dosage: "20mg",
            quantity: "30 tablets",
            frequency: "Once daily at bedtime",
            prescribedBy: "Dr. Sarah Johnson",
            prescribedDate: "2024-01-10",
            validUntil: "2024-07-10",
            status: "completed",
            refillsRemaining: 0,
            totalRefills: 3,
            pharmacy: "CVS Pharmacy",
            instructions: "Take at bedtime. Avoid grapefruit juice.",
            diagnosis: "High Cholesterol",
            ndc: "0071-0222-23",
            daw: false,
            sideEffects: ["Muscle pain", "Joint pain", "Digestive problems"],
            contraindications: ["Liver disease", "Pregnancy"],
            interactions: ["Grapefruit juice", "Antacids"],
            refillHistory: [
                {
                    id: "RF003",
                    prescriptionId: "RX003",
                    requestedDate: "2024-01-10",
                    status: "completed",
                    processedDate: "2024-01-11",
                    pharmacy: "CVS Pharmacy"
                }
            ],
            prescriptionHistory: [
                {
                    id: "PH003",
                    prescriptionId: "RX003",
                    action: "filled",
                    date: "2024-01-10",
                    performedBy: "Dr. Sarah Johnson"
                }
            ],
            lastFilledDate: "2024-01-11",
            nextRefillDate: "2024-02-10",
            adherenceRate: "100%",
            notes: "Patient tolerating well",
            attachments: [
                {
                    id: "ATT003",
                    name: "Prescription_Label.pdf",
                    type: "application/pdf",
                    url: "/attachments/RX003_label.pdf",
                    uploadedAt: "2024-01-10"
                }
            ]
        },
        {
            id: "RX004",
            medication: "Albuterol",
            genericName: "Albuterol",
            dosage: "90mcg",
            quantity: "1 inhaler",
            frequency: "As needed",
            prescribedBy: "Dr. Michael Chen",
            prescribedDate: "2024-02-01",
            validUntil: "2024-08-01",
            status: "pending",
            refillsRemaining: 2,
            totalRefills: 2,
            pharmacy: "Walgreens",
            instructions: "Use 2 puffs every 4-6 hours as needed for shortness of breath.",
            diagnosis: "Asthma",
            ndc: "0093-1074-01",
            daw: false,
            sideEffects: ["Tremor", "Nervousness", "Headache"],
            contraindications: ["Hypersensitivity to albuterol"],
            interactions: ["Beta-blockers", "Diuretics"],
            refillHistory: [],
            prescriptionHistory: [
                {
                    id: "PH004",
                    prescriptionId: "RX004",
                    action: "filled",
                    date: "2024-02-01",
                    performedBy: "Dr. Michael Chen"
                }
            ],
            lastFilledDate: undefined,
            nextRefillDate: "2024-02-01",
            adherenceRate: "N/A",
            notes: "New prescription",
            attachments: [
                {
                    id: "ATT004",
                    name: "Prescription_Label.pdf",
                    type: "application/pdf",
                    url: "/attachments/RX004_label.pdf",
                    uploadedAt: "2024-02-01"
                }
            ]
        },
    ]
}

const requestRefill = async (prescriptionId: string): Promise<PrescriptionRefill> => {
    await wait(1000)
    return {
        id: `RF${Date.now()}`,
        prescriptionId,
        requestedDate: new Date().toISOString(),
        status: "pending",
        pharmacy: "CVS Pharmacy"
    }
}

const downloadPrescription = async (prescriptionId: string): Promise<string> => {
    await wait(500)
    return `/api/prescriptions/${prescriptionId}/download`
}

interface SharePrescriptionParams {
    prescriptionId: string;
    doctorId: string;
}

const sharePrescription = async ({ prescriptionId, doctorId }: SharePrescriptionParams): Promise<void> => {
    await wait(500)
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

