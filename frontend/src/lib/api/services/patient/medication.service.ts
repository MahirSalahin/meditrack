import { wait } from "@/lib/wait"
import { MedicationDetails, UpcomingDose, MedicationStats } from "./types"
import { useQuery } from "@tanstack/react-query"

// Separate data fetching functions for each component
const getQuickActionsData = async (): Promise<{
    nextDose: { name: string; timeLeft: string }
    takenToday: string
    missedCount: number
}> => {
    await wait(500)
    return {
        nextDose: {
            name: "Lisinopril",
            timeLeft: "2 hours"
        },
        takenToday: "26/28",
        missedCount: 1
    }
}

const getMedicationsListData = async (): Promise<MedicationDetails[]> => {
    await wait(700)
    return [
        {
            id: "1",
            name: "Lisinopril",
            genericName: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            nextDose: "8:00 AM",
            timeLeft: "2 hours",
            color: "bg-blue-500",
            status: "active",
            prescribedBy: "Dr. Sarah Johnson",
            startDate: "2024-01-01",
            endDate: "2024-06-01",
            instructions: "Take with food. Monitor blood pressure.",
            sideEffects: "Dizziness, dry cough",
            refillsLeft: 3,
            pharmacy: "CVS Pharmacy",
        },
        {
            id: "2",
            name: "Metformin",
            genericName: "Metformin HCl",
            dosage: "500mg",
            frequency: "Twice daily",
            nextDose: "6:00 PM",
            timeLeft: "8 hours",
            color: "bg-green-500",
            status: "active",
            prescribedBy: "Dr. Michael Chen",
            startDate: "2023-12-15",
            endDate: "2024-12-15",
            instructions: "Take with meals to reduce stomach upset.",
            sideEffects: "Nausea, stomach upset",
            refillsLeft: 5,
            pharmacy: "Walgreens",
        },
        {
            id: "3",
            name: "Vitamin D3",
            genericName: "Cholecalciferol",
            dosage: "1000 IU",
            frequency: "Once daily",
            nextDose: "Tomorrow 8:00 AM",
            timeLeft: "14 hours",
            color: "bg-orange-500",
            status: "active",
            prescribedBy: "Dr. Sarah Johnson",
            startDate: "2024-01-10",
            endDate: "2024-07-10",
            instructions: "Take with fatty meal for better absorption.",
            sideEffects: "Rare: nausea, vomiting",
            refillsLeft: 2,
            pharmacy: "CVS Pharmacy",
        },
        {
            id: "4",
            name: "Aspirin",
            genericName: "Acetylsalicylic acid",
            dosage: "81mg",
            frequency: "Once daily",
            nextDose: "Missed - 8:00 AM",
            timeLeft: "Overdue",
            color: "bg-red-500",
            status: "missed",
            prescribedBy: "Dr. Sarah Johnson",
            startDate: "2023-11-01",
            endDate: "Ongoing",
            instructions: "Take with food to prevent stomach irritation.",
            sideEffects: "Stomach upset, bleeding risk",
            refillsLeft: 1,
            pharmacy: "CVS Pharmacy",
        },
    ]
}

const getTodayScheduleData = async (): Promise<UpcomingDose[]> => {
    await wait(300)
    return [
        { medication: "Lisinopril", time: "8:00 AM", status: "upcoming" },
        { medication: "Metformin", time: "6:00 PM", status: "upcoming" },
        { medication: "Vitamin D3", time: "8:00 AM Tomorrow", status: "scheduled" },
    ]
}

const getMedicationStatsData = async (): Promise<MedicationStats> => {
    await wait(400)
    return {
        activeMedications: 4,
        adherenceRate: "92%",
        dosesThisWeek: "26/28",
        refillsNeeded: 2,
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