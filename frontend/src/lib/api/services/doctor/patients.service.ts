import axiosInstance from "@/lib/axios-interceptor"
import { wait } from "@/lib/wait"
import { BookmarkPatient, PatientProfileForDoctor } from "@/types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
    isBookmarked?: boolean
}

export interface PatientStats {
    total: number
    stable: number
    monitoring: number
    critical: number
    newThisMonth: number
    bookmarked: number
}

export interface SearchFilters {
    name?: string
    status?: string
    condition?: string
    showBookmarkedOnly?: boolean
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
            },
            isBookmarked: true
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
            },
            isBookmarked: false
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
            },
            isBookmarked: true
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
            },
            isBookmarked: false
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
            },
            isBookmarked: false
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
        newThisMonth: 8,
        bookmarked: 2
    }
}

// Search patient by ID
const searchPatientById = async (patientId: string): Promise<Patient | null> => {
    await wait(600)
    const patients = await getPatientsData()
    const patient = patients.find(p => p.id.toLowerCase() === patientId.toLowerCase())
    return patient || null
}

// Get patient by ID for detailed view
const getPatientById = async (patientId: string): Promise<Patient | null> => {
    await wait(400)
    const patients = await getPatientsData()
    const patient = patients.find(p => p.id === patientId)
    return patient || null
}

// Get bookmarked patients
const getBookmarkedPatients = async (): Promise<Patient[]> => {
    await wait(500)
    const patients = await getPatientsData()
    return patients.filter(p => p.isBookmarked)
}

// Toggle bookmark status
const toggleBookmark = async (): Promise<{ success: boolean }> => {
    await wait(300)
    // In a real app, this would make an API call to update the bookmark status
    return { success: true }
}

// Filter patients
const filterPatients = async (filters: SearchFilters): Promise<Patient[]> => {
    await wait(400)
    const patients = await getPatientsData()

    return patients.filter(patient => {
        if (filters.showBookmarkedOnly && !patient.isBookmarked) return false
        if (filters.name && !patient.name.toLowerCase().includes(filters.name.toLowerCase())) return false
        if (filters.status && patient.status !== filters.status) return false
        if (filters.condition && !patient.condition.toLowerCase().includes(filters.condition.toLowerCase())) return false
        return true
    })
}

// Service object for direct API calls
export const patientsService = {
    getPatients: getPatientsData,
    getPatientStats: getPatientStatsData,
    searchPatientById,
    getPatientById,
    getBookmarkedPatients,
    toggleBookmark,
    filterPatients
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

export const useSearchPatient = (patientId: string | null) => {
    return useQuery({
        queryKey: ["patient-search", patientId],
        queryFn: async () => {
            if (!patientId) return null
            const response = await axiosInstance.get<PatientProfileForDoctor>(`/profiles/patients/${patientId}`)
            console.log(response.data)
            return response.data
        },
        enabled: !!patientId
    })
}

export const useBookmarkedPatients = () => {
    return useQuery({
        queryKey: ["bookmarked-patients"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get<BookmarkPatient>("/profiles/bookmark")
                return response.data
            } catch (error) {
                console.error("Error fetching bookmarked patients:", error)
                toast.error("Failed to fetch bookmarked patients")
            }
        },
    })
}

export const useFilterPatients = (filters: SearchFilters) => {
    return useQuery({
        queryKey: ["filtered-patients", filters],
        queryFn: () => patientsService.filterPatients(filters)
    })
}

export const useToggleBookmark = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (patientId: string) => {
            const response = await axiosInstance.post<{ success: boolean }>(`/profiles/bookmark/${patientId}/toggle`)
            return response.data
        },
        onSuccess: () => {
            // Invalidate and refetch relevant queries
            queryClient.invalidateQueries({ queryKey: ["patients"] })
            queryClient.invalidateQueries({ queryKey: ["bookmarked-patients"] })
            queryClient.invalidateQueries({ queryKey: ["patient-search"] })
            queryClient.invalidateQueries({ queryKey: ["patient"] })
        }
    })
}

export const usePatientById = (patientId: string) => {
    return useQuery({
        queryKey: ["patient", patientId],
        queryFn: async () => {
            try {
                if (!patientId) return null
                const response = await axiosInstance.get<PatientProfileForDoctor>(`/profiles/patients/${patientId}`)
                return response.data
            } catch {
                toast.error("Failed to fetch patient details")
                return null
            }
        },
        enabled: !!patientId
    })
} 

