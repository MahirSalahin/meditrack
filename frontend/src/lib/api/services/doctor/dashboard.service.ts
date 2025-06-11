import { wait } from "@/lib/wait"
import { useQuery } from "@tanstack/react-query"

export interface DoctorDashboardStats {
    totalPatients: number
    totalAppointments: number
    newPatientsThisMonth: number
    completedAppointmentsThisMonth: number
}

export interface TodaysAppointment {
    id: string
    patientId: string
    patientName: string
    time: string
    duration: string
    type: string
    status: "scheduled" | "confirmed" | "completed" | "cancelled"
    reason?: string
}

export interface DoctorDashboardData {
    stats: DoctorDashboardStats
    todaysAppointments: TodaysAppointment[]
}

const getDoctorDashboardData = async (): Promise<DoctorDashboardData> => {
    await wait(600)
    return {
        stats: {
            totalPatients: 247,
            totalAppointments: 156,
            newPatientsThisMonth: 12,
            completedAppointmentsThisMonth: 89
        },
        todaysAppointments: [
            {
                id: "APT001",
                patientId: "PAT001",
                patientName: "John Smith",
                time: "9:00 AM",
                duration: "30 min",
                type: "Follow-up",
                status: "confirmed",
                reason: "Blood pressure check"
            },
            {
                id: "APT002",
                patientId: "PAT002",
                patientName: "Sarah Johnson",
                time: "9:30 AM",
                duration: "45 min",
                type: "Consultation",
                status: "scheduled",
                reason: "Annual checkup"
            },
            {
                id: "APT003",
                patientId: "PAT003",
                patientName: "Michael Chen",
                time: "10:30 AM",
                duration: "30 min",
                type: "Follow-up",
                status: "completed",
                reason: "Diabetes management"
            },
            {
                id: "APT004",
                patientId: "PAT004",
                patientName: "Emily Davis",
                time: "11:00 AM",
                duration: "30 min",
                type: "Check-up",
                status: "confirmed",
                reason: "Routine examination"
            },
            {
                id: "APT005",
                patientId: "PAT005",
                patientName: "Robert Wilson",
                time: "2:00 PM",
                duration: "45 min",
                type: "Consultation",
                status: "scheduled",
                reason: "Chest pain evaluation"
            },
            {
                id: "APT006",
                patientId: "PAT006",
                patientName: "Lisa Anderson",
                time: "3:00 PM",
                duration: "30 min",
                type: "Follow-up",
                status: "cancelled",
                reason: "Medication review"
            }
        ]
    }
}

export const useDoctorDashboard = () => {
    return useQuery({
        queryKey: ["doctor-dashboard"],
        queryFn: getDoctorDashboardData
    })
}