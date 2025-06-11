import { wait } from "@/lib/wait"
import { useQuery } from "@tanstack/react-query"

export interface PatientBasicInfo {
    patientId: string
    name: string
    age: number
    gender: string
    dateOfBirth: string
    bloodType: string
    status: "stable" | "monitoring" | "critical"
    lastVisit: string
    totalVisits: number
    address: string
    contact: {
        phone: string
        email: string
    }
}

export interface MedicalCondition {
    id: string
    name: string
    diagnosedDate: string
    severity: "mild" | "moderate" | "severe"
    status: "active" | "managed" | "resolved"
    notes?: string
}

export interface Allergy {
    allergen: string
    reaction: string
    severity: "mild" | "moderate" | "severe"
    notes?: string
}

export interface VitalSign {
    type: string
    value: string
    unit: string
    date: string
    status: "normal" | "high" | "low" | "critical"
}

export interface CurrentMedication {
    id: string
    name: string
    dosage: string
    frequency: string
    startDate: string
    endDate?: string
    prescribedBy: string
    instructions: string
    status: "active" | "paused" | "discontinued"
    sideEffects?: string[]
}

export interface TimelineEvent {
    id: string
    type: "visit" | "test" | "prescription" | "procedure" | "admission"
    title: string
    description: string
    date: string
    doctor: string
    priority?: "normal" | "high" | "urgent"
    relatedId?: string
    outcome?: string
}

export interface TestReport {
    id: string
    testName: string
    testType: string
    date: string
    status: "pending" | "completed" | "cancelled"
    results?: string
    abnormalFlags?: string[]
}

export interface MedicalDocument {
    id: string
    name: string
    type: string
    date: string
    uploadedBy: string
    size: string
    url: string
}

export interface PatientHistoryData {
    basicInfo: PatientBasicInfo
    conditions: MedicalCondition[]
    allergies: Allergy[]
    vitals: VitalSign[]
    medications: CurrentMedication[]
    timeline: TimelineEvent[]
    testReports: TestReport[]
    documents: MedicalDocument[]
}

const getPatientHistoryData = async (patientId: string): Promise<PatientHistoryData> => {
    await wait(800)
    
    // Mock data - replace with actual API call
    return {
        basicInfo: {
            patientId: "PAT001",
            name: "John Smith",
            age: 45,
            gender: "Male",
            dateOfBirth: "1979-03-15",
            bloodType: "O+",
            status: "stable",
            lastVisit: "2024-02-15",
            totalVisits: 12,
            address: "123 Main St, City, State 12345",
            contact: {
                phone: "(555) 123-4567",
                email: "john.smith@email.com"
            }
        },
        conditions: [
            {
                id: "COND001",
                name: "Hypertension",
                diagnosedDate: "2020-05-15",
                severity: "moderate",
                status: "managed",
                notes: "Well controlled with medication"
            },
            {
                id: "COND002",
                name: "Type 2 Diabetes",
                diagnosedDate: "2021-08-20",
                severity: "mild",
                status: "active",
                notes: "Diet and medication management"
            }
        ],
        allergies: [
            {
                allergen: "Penicillin",
                reaction: "Skin rash",
                severity: "moderate",
                notes: "Developed rash within hours of taking"
            },
            {
                allergen: "Shellfish",
                reaction: "Anaphylaxis",
                severity: "severe",
                notes: "Requires immediate medical attention"
            }
        ],
        vitals: [
            {
                type: "Blood Pressure",
                value: "130/85",
                unit: "mmHg",
                date: "2024-02-15",
                status: "high"
            },
            {
                type: "Heart Rate",
                value: "72",
                unit: "bpm",
                date: "2024-02-15",
                status: "normal"
            },
            {
                type: "Temperature",
                value: "98.6",
                unit: "°F",
                date: "2024-02-15",
                status: "normal"
            },
            {
                type: "Weight",
                value: "180",
                unit: "lbs",
                date: "2024-02-15",
                status: "normal"
            },
            {
                type: "BMI",
                value: "24.5",
                unit: "",
                date: "2024-02-15",
                status: "normal"
            },
            {
                type: "O2 Saturation",
                value: "98",
                unit: "%",
                date: "2024-02-15",
                status: "normal"
            }
        ],
        medications: [
            {
                id: "MED001",
                name: "Lisinopril",
                dosage: "10mg",
                frequency: "Once daily",
                startDate: "2020-05-15",
                prescribedBy: "Dr. Sarah Johnson",
                instructions: "Take with or without food, preferably at the same time each day",
                status: "active"
            },
            {
                id: "MED002",
                name: "Metformin",
                dosage: "500mg",
                frequency: "Twice daily",
                startDate: "2021-08-20",
                prescribedBy: "Dr. Michael Chen",
                instructions: "Take with meals to reduce stomach upset",
                status: "active"
            },
            {
                id: "MED003",
                name: "Atorvastatin",
                dosage: "20mg",
                frequency: "Once daily at bedtime",
                startDate: "2022-01-10",
                prescribedBy: "Dr. Sarah Johnson",
                instructions: "Take at bedtime. Avoid grapefruit juice",
                status: "active"
            }
        ],
        timeline: [
            {
                id: "TL001",
                type: "visit",
                title: "Follow-up Visit",
                description: "Routine follow-up for hypertension and diabetes management",
                date: "2024-02-15",
                doctor: "Sarah Johnson",
                priority: "normal",
                outcome: "Stable condition, continue current medications"
            },
            {
                id: "TL002",
                type: "test",
                title: "HbA1c Test",
                description: "Quarterly diabetes monitoring test",
                date: "2024-02-15",
                doctor: "Sarah Johnson",
                priority: "normal",
                relatedId: "TEST001",
                outcome: "7.2% - Acceptable control"
            },
            {
                id: "TL003",
                type: "prescription",
                title: "Medication Adjustment",
                description: "Increased Lisinopril dosage from 5mg to 10mg",
                date: "2024-01-20",
                doctor: "Sarah Johnson",
                priority: "normal",
                relatedId: "PRESC001"
            },
            {
                id: "TL004",
                type: "test",
                title: "Complete Blood Count",
                description: "Routine blood work to monitor overall health",
                date: "2024-01-20",
                doctor: "Sarah Johnson",
                priority: "normal",
                relatedId: "TEST002",
                outcome: "All parameters within normal range"
            },
            {
                id: "TL005",
                type: "visit",
                title: "Initial Diabetes Consultation",
                description: "First visit after diabetes diagnosis",
                date: "2021-08-20",
                doctor: "Michael Chen",
                priority: "high",
                outcome: "Started on Metformin, dietary counseling provided"
            }
        ],
        testReports: [
            {
                id: "TEST001",
                testName: "HbA1c",
                testType: "Blood",
                date: "2024-02-15",
                status: "completed",
                results: "7.2%",
                abnormalFlags: ["Elevated"]
            },
            {
                id: "TEST002",
                testName: "Complete Blood Count",
                testType: "Blood",
                date: "2024-01-20",
                status: "completed",
                results: "Normal"
            },
            {
                id: "TEST003",
                testName: "Lipid Panel",
                testType: "Blood",
                date: "2024-01-20",
                status: "completed",
                results: "Total Cholesterol: 180 mg/dL"
            },
            {
                id: "TEST004",
                testName: "Chest X-Ray",
                testType: "Imaging",
                date: "2023-12-15",
                status: "completed",
                results: "No acute abnormalities"
            },
            {
                id: "TEST005",
                testName: "ECG",
                testType: "Cardiac",
                date: "2023-12-15",
                status: "completed",
                results: "Normal sinus rhythm"
            }
        ],
        documents: [
            {
                id: "DOC001",
                name: "Insurance Card Copy",
                type: "Insurance",
                date: "2024-01-01",
                uploadedBy: "John Smith",
                size: "245 KB",
                url: "/documents/insurance-card.pdf"
            },
            {
                id: "DOC002",
                name: "Previous Medical Records",
                type: "Medical History",
                date: "2020-05-15",
                uploadedBy: "Dr. Sarah Johnson",
                size: "1.2 MB",
                url: "/documents/previous-records.pdf"
            },
            {
                id: "DOC003",
                name: "Prescription History",
                type: "Prescription",
                date: "2024-02-15",
                uploadedBy: "System",
                size: "156 KB",
                url: "/documents/prescription-history.pdf"
            }
        ]
    }
}

export const usePatientHistory = (patientId: string) => {
    return useQuery({
        queryKey: ["patient-history", patientId],
        queryFn: () => getPatientHistoryData(patientId),
        enabled: !!patientId
    })
}