import axiosInstance from "@/lib/axios-interceptor"
import { MedicationDetails, UpcomingDose, MedicationStats } from "./types"
import { useQuery } from "@tanstack/react-query"

// API function for quick actions data
const getQuickActionsData = async (): Promise<{
    nextDose: { name: string; timeLeft: string }
    takenToday: string
    missedCount: number
}> => {
    try {
        // TODO: Implement real API call for medication quick actions
        // For now, return default data since this specific endpoint doesn't exist
        return {
            nextDose: {
                name: "No upcoming doses",
                timeLeft: "N/A"
            },
            takenToday: "0/0",
            missedCount: 0
        }
    } catch (error) {
        console.error("Error fetching quick actions:", error)
        return {
            nextDose: { name: "Error loading", timeLeft: "N/A" },
            takenToday: "0/0",
            missedCount: 0
        }
    }
}

const getMedicationsListData = async (): Promise<MedicationDetails[]> => {
    try {
        const response = await axiosInstance.get("/medications/my/list-items")
        const medications = response.data?.medications || []

        return medications.map((med: any) => ({
            id: med.id,
            name: med.medication_name,
            genericName: med.medication_name, // Using same as name since generic not available
            dosage: med.dosage,
            frequency: med.frequency,
            nextDose: "Next dose TBD", // TODO: Calculate next dose time
            timeLeft: "TBD", // TODO: Calculate time remaining
            color: "bg-blue-500", // Default color
            status: "active", // Default status
            prescribedBy: med.doctor?.name || "Dr. Unknown",
            startDate: med.prescribed_date || "Unknown",
            endDate: "TBD", // Not available in current schema
            instructions: med.instructions || "No instructions provided",
            sideEffects: "Consult doctor", // Not available in current schema
            refillsLeft: 0, // Not available in current schema
            pharmacy: "TBD", // Not available in current schema
        }))
    } catch (error) {
        console.error("Error fetching medications list:", error)
        return []
    }
}

const getTodayScheduleData = async (): Promise<UpcomingDose[]> => {
    // TODO: Implement real API call for today's medication schedule
    return []
}

const getMedicationStatsData = async (): Promise<MedicationStats> => {
    try {
        const response = await axiosInstance.get("/medications/my/stats")
        const stats = response.data

        return {
            activeMedications: stats.active_medications || 0,
            adherenceRate: `${stats.adherence_rate || 0}%`,
            dosesThisWeek: `${stats.doses_taken_this_week || 0}/${stats.total_doses_this_week || 0}`,
            refillsNeeded: stats.refills_needed || 0,
        }
    } catch (error) {
        console.error("Error fetching medication stats:", error)
        return {
            activeMedications: 0,
            adherenceRate: "0%",
            dosesThisWeek: "0/0",
            refillsNeeded: 0,
        }
    }
}

// Query hooks for each component
export const useQuickActions = () => {
    return useQuery({
        queryKey: ["medication-quick-actions"],
        queryFn: getQuickActionsData,
    })
}

export const useMedicationsList = () => {
    return useQuery({
        queryKey: ["medication-list"],
        queryFn: getMedicationsListData,
    })
}

export const useTodaySchedule = () => {
    return useQuery({
        queryKey: ["medication-today-schedule"],
        queryFn: getTodayScheduleData,
    })
}

export const useMedicationStats = () => {
    return useQuery({
        queryKey: ["medication-stats"],
        queryFn: getMedicationStatsData,
    })
}

// Service object for direct API calls
export const medicationService = {
    getQuickActions: getQuickActionsData,
    getMedicationsList: getMedicationsListData,
    getTodaySchedule: getTodayScheduleData,
    getMedicationStats: getMedicationStatsData,
} 