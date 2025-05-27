import { wait } from "@/lib/wait"
import { useQuery } from "@tanstack/react-query"

export interface Appointment {
    id: string
    patientId: string
    patientName: string
    patientAge: number
    patientGender: string
    date: string
    time: string
    duration: string
    type: "checkup" | "follow-up" | "consultation" | "procedure"
    status: "scheduled" | "confirmed" | "completed" | "cancelled"
    reason: string
    notes: string
    location: string
    appointmentType: "in-person" | "virtual"
    priority: "normal" | "urgent" | "emergency"
    previousVisits: number
    lastVisitDate: string
}

export interface AppointmentStats {
    total: number
    today: number
    upcoming: number
    completed: number
    cancelled: number
}

const getAppointmentsData = async (): Promise<Appointment[]> => {
    await wait(800)
    return [
        {
            id: "APT001",
            patientId: "PAT001",
            patientName: "John Smith",
            patientAge: 45,
            patientGender: "Male",
            date: "2024-03-15",
            time: "10:00 AM",
            duration: "30 minutes",
            type: "follow-up",
            status: "scheduled",
            reason: "Blood pressure follow-up",
            notes: "Patient reported mild dizziness last week",
            location: "Main Clinic - Room 101",
            appointmentType: "in-person",
            priority: "normal",
            previousVisits: 3,
            lastVisitDate: "2024-02-15"
        },
        {
            id: "APT002",
            patientId: "PAT002",
            patientName: "Sarah Johnson",
            patientAge: 32,
            patientGender: "Female",
            date: "2024-03-15",
            time: "11:30 AM",
            duration: "45 minutes",
            type: "consultation",
            status: "confirmed",
            reason: "Diabetes management review",
            notes: "Recent blood sugar levels elevated",
            location: "Main Clinic - Room 102",
            appointmentType: "in-person",
            priority: "urgent",
            previousVisits: 5,
            lastVisitDate: "2024-02-20"
        },
        {
            id: "APT003",
            patientId: "PAT003",
            patientName: "Michael Brown",
            patientAge: 58,
            patientGender: "Male",
            date: "2024-03-15",
            time: "2:00 PM",
            duration: "60 minutes",
            type: "procedure",
            status: "scheduled",
            reason: "Cardiac stress test",
            notes: "Patient needs to fast for 12 hours before",
            location: "Cardiology Department",
            appointmentType: "in-person",
            priority: "urgent",
            previousVisits: 2,
            lastVisitDate: "2024-02-18"
        },
        {
            id: "APT004",
            patientId: "PAT004",
            patientName: "Emily Davis",
            patientAge: 29,
            patientGender: "Female",
            date: "2024-03-16",
            time: "9:00 AM",
            duration: "30 minutes",
            type: "checkup",
            status: "confirmed",
            reason: "Annual physical examination",
            notes: "Routine checkup, no specific concerns",
            location: "Main Clinic - Room 103",
            appointmentType: "in-person",
            priority: "normal",
            previousVisits: 1,
            lastVisitDate: "2024-02-10"
        },
        {
            id: "APT005",
            patientId: "PAT005",
            patientName: "Robert Wilson",
            patientAge: 50,
            patientGender: "Male",
            date: "2024-03-16",
            time: "10:30 AM",
            duration: "45 minutes",
            type: "follow-up",
            status: "scheduled",
            reason: "Arthritis treatment review",
            notes: "Patient reports increased joint pain",
            location: "Main Clinic - Room 104",
            appointmentType: "in-person",
            priority: "normal",
            previousVisits: 4,
            lastVisitDate: "2024-02-22"
        }
    ]
}

const getAppointmentStatsData = async (): Promise<AppointmentStats> => {
    await wait(500)
    return {
        total: 24,
        today: 5,
        upcoming: 15,
        completed: 3,
        cancelled: 1
    }
}

// Service object for direct API calls
export const appointmentsService = {
    getAppointments: getAppointmentsData,
    getAppointmentStats: getAppointmentStatsData
}

// React Query hooks
export const useAppointments = () => {
    return useQuery({
        queryKey: ["appointments"],
        queryFn: appointmentsService.getAppointments
    })
}

export const useAppointmentStats = () => {
    return useQuery({
        queryKey: ["appointment-stats"],
        queryFn: appointmentsService.getAppointmentStats
    })
} 