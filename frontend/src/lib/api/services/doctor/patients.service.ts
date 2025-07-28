import axiosInstance from "@/lib/axios-interceptor"
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
    try {
        const response = await axiosInstance.get("/profiles/doctors/patients")
        const patients = response.data?.patients || []
        
        return patients.map((patient: any) => ({
            id: patient.id,
            name: patient.name,
            age: patient.age || 0,
            gender: patient.gender || "Unknown",
            lastVisit: patient.last_visit || "Unknown",
            nextAppointment: "TBD", // Not available in current schema
            condition: patient.medical_history || "No condition listed",
            status: "stable", // Default status since not available
            bloodType: patient.blood_group || "Unknown",
            allergies: patient.allergies || [],
            medications: [], // Would need separate API call
            contact: {
                email: patient.email || "No email",
                phone: patient.phone || "No phone"
            },
            isBookmarked: patient.is_bookmarked || false
        }))
    } catch (error) {
        console.error("Error fetching patients:", error)
        return []
    }
}

const getPatientStatsData = async (): Promise<PatientStats> => {
    try {
        // Instead of fetching all patients, return basic stats
        // TODO: Replace with dedicated stats API endpoint when available
        return {
            total: 0, // Will be updated when real stats API is available
            stable: 0,
            monitoring: 0,
            critical: 0,
            newThisMonth: 0,
            bookmarked: 0
        }
    } catch (error) {
        console.error("Error fetching patient stats:", error)
        return {
            total: 0,
            stable: 0,
            monitoring: 0,
            critical: 0,
            newThisMonth: 0,
            bookmarked: 0
        }
    }
}

// Search patient by ID
const searchPatientById = async (patientId: string): Promise<Patient | null> => {
    try {
        const response = await axiosInstance.get(`/profiles/patients/${patientId}`)
        const patient = response.data
        
        // Transform to match Patient interface
        return {
            id: patient.id,
            name: patient.name,
            age: patient.age || 0,
            gender: patient.gender || "Unknown",
            lastVisit: patient.last_visit || "Unknown",
            nextAppointment: "TBD",
            condition: patient.medical_history || "No condition listed",
            status: "stable",
            bloodType: patient.blood_group || "Unknown",
            allergies: patient.allergies || [],
            medications: [],
            contact: {
                email: patient.email || "No email",
                phone: patient.phone || "No phone"
            },
            isBookmarked: patient.is_bookmarked || false
        }
    } catch (error) {
        console.error("Error searching patient:", error)
        return null
    }
}

// Get patient by ID for detailed view
const getPatientById = async (patientId: string): Promise<Patient | null> => {
    // Use the same API as searchPatientById
    return searchPatientById(patientId)
}

// Get bookmarked patients
const getBookmarkedPatients = async (): Promise<Patient[]> => {
    try {
        const response = await axiosInstance.get("/profiles/bookmark")
        const patients = response.data?.patients || []
        
        return patients.map((patient: any) => ({
            id: patient.id,
            name: patient.name,
            age: patient.age || 0,
            gender: patient.gender || "Unknown",
            lastVisit: patient.last_visit || "Unknown",
            nextAppointment: "TBD",
            condition: patient.medical_history || "No condition listed",
            status: "stable",
            bloodType: patient.blood_group || "Unknown",
            allergies: patient.allergies || [],
            medications: [],
            contact: {
                email: patient.email || "No email",
                phone: patient.phone || "No phone"
            },
            isBookmarked: true // These are all bookmarked patients
        }))
    } catch (error) {
        console.error("Error fetching bookmarked patients:", error)
        return []
    }
}

// Toggle bookmark status
const toggleBookmark = async (patientId: string): Promise<{ success: boolean }> => {
    try {
        await axiosInstance.post(`/profiles/bookmark/${patientId}/toggle`)
        return { success: true }
    } catch (error) {
        console.error("Error toggling bookmark:", error)
        return { success: false }
    }
}

// Filter patients
const filterPatients = async (filters: SearchFilters): Promise<Patient[]> => {
    try {
        const patients = await getPatientsData()

        return patients.filter(patient => {
            if (filters.showBookmarkedOnly && !patient.isBookmarked) return false
            if (filters.name && !patient.name.toLowerCase().includes(filters.name.toLowerCase())) return false
            if (filters.status && patient.status !== filters.status) return false
            if (filters.condition && !patient.condition.toLowerCase().includes(filters.condition.toLowerCase())) return false
            return true
        })
    } catch (error) {
        console.error("Error filtering patients:", error)
        return []
    }
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
export const usePatients = (enabled: boolean = false) => {
    return useQuery({
        queryKey: ["patients"],
        queryFn: patientsService.getPatients,
        enabled // Only fetch when explicitly enabled
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

