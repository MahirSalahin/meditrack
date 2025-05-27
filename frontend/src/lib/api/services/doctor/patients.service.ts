import { wait } from "@/lib/wait"
import { useQuery } from "@tanstack/react-query"

export interface Patient {
    id: string
    name: string
    age: number
    gender: string
    lastVisit: string
    nextAppointment: string
    condition: string
    status: "stable" | "monitoring" | "critical"
    bloodType: string
    allergies: string[]
    medications: string[]
    contact: {
        email: string
        phone: string
    }
}

export interface PatientStats {
    total: number
    stable: number
    monitoring: number
    critical: number
    newThisMonth: number
}

const getPatientsData = async (): Promise<Patient[]> => {
    await wait(800)
    return [
        {
            id: "PAT001",
            name: "John Smith",
            age: 45,
            gender: "Male",
            lastVisit: "2024-02-15",
            nextAppointment: "2024-03-15",
            condition: "Hypertension",
            status: "stable",
            bloodType: "O+",
            allergies: ["Penicillin", "Shellfish"],
            medications: ["Lisinopril", "Metformin"],
            contact: {
                email: "john.smith@email.com",
                phone: "(555) 123-4567"
            }
        },
        {
            id: "PAT002",
            name: "Sarah Johnson",
            age: 32,
            gender: "Female",
            lastVisit: "2024-02-20",
            nextAppointment: "2024-03-01",
            condition: "Type 2 Diabetes",
            status: "monitoring",
            bloodType: "A+",
            allergies: ["Latex"],
            medications: ["Metformin", "Insulin"],
            contact: {
                email: "sarah.j@email.com",
                phone: "(555) 234-5678"
            }
        },
        {
            id: "PAT003",
            name: "Michael Brown",
            age: 58,
            gender: "Male",
            lastVisit: "2024-02-18",
            nextAppointment: "2024-02-25",
            condition: "Heart Disease",
            status: "critical",
            bloodType: "B-",
            allergies: ["Aspirin"],
            medications: ["Atorvastatin", "Aspirin"],
            contact: {
                email: "michael.b@email.com",
                phone: "(555) 345-6789"
            }
        },
        {
            id: "PAT004",
            name: "Emily Davis",
            age: 29,
            gender: "Female",
            lastVisit: "2024-02-10",
            nextAppointment: "2024-03-10",
            condition: "Asthma",
            status: "stable",
            bloodType: "AB+",
            allergies: ["Dust", "Pollen"],
            medications: ["Albuterol", "Fluticasone"],
            contact: {
                email: "emily.d@email.com",
                phone: "(555) 456-7890"
            }
        },
        {
            id: "PAT005",
            name: "Robert Wilson",
            age: 50,
            gender: "Male",
            lastVisit: "2024-02-22",
            nextAppointment: "2024-03-22",
            condition: "Arthritis",
            status: "monitoring",
            bloodType: "O-",
            allergies: ["Ibuprofen"],
            medications: ["Methotrexate", "Folic Acid"],
            contact: {
                email: "robert.w@email.com",
                phone: "(555) 567-8901"
            }
        }
    ]
}

const getPatientStatsData = async (): Promise<PatientStats> => {
    await wait(500)
    return {
        total: 156,
        stable: 98,
        monitoring: 45,
        critical: 13,
        newThisMonth: 8
    }
}

// Service object for direct API calls
export const patientsService = {
    getPatients: getPatientsData,
    getPatientStats: getPatientStatsData
}

// React Query hooks
export const usePatients = () => {
    return useQuery({
        queryKey: ["patients"],
        queryFn: patientsService.getPatients
    })
}

export const usePatientStats = () => {
    return useQuery({
        queryKey: ["patient-stats"],
        queryFn: patientsService.getPatientStats
    })
} 