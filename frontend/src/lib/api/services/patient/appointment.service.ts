import { Appointment } from "@/lib/api/services/patient/types"
import { wait } from "@/lib/wait"
import { useQuery } from "@tanstack/react-query"

// Static data functions
const getAppointmentsData = async (): Promise<Appointment[]> => {
    await wait(600)
    return [
        {
            id: "APT001",
            doctor: "Dr. Sarah Johnson",
            specialty: "Cardiology",
            date: "2024-01-25",
            time: "10:00 AM",
            duration: "30 minutes",
            type: "Follow-up",
            status: "confirmed",
            location: "City Medical Center",
            address: "123 Medical Drive, Suite 200",
            phone: "(555) 123-4567",
            appointmentType: "in-person",
            reason: "Blood pressure follow-up",
            notes: "Bring current medication list",
            insurance: "Covered by Blue Cross",
            copay: "$25",
        },
        {
            id: "APT002",
            doctor: "Dr. Michael Chen",
            specialty: "Endocrinology",
            date: "2024-01-30",
            time: "2:30 PM",
            duration: "45 minutes",
            type: "Consultation",
            status: "confirmed",
            location: "Diabetes Care Center",
            address: "456 Health Plaza, Floor 3",
            phone: "(555) 234-5678",
            appointmentType: "in-person",
            reason: "Diabetes management review",
            notes: "Fasting required - no food 12 hours before",
            insurance: "Covered by Blue Cross",
            copay: "$40",
        },
        {
            id: "APT003",
            doctor: "Dr. Emily Rodriguez",
            specialty: "Dermatology",
            date: "2024-02-05",
            time: "11:15 AM",
            duration: "20 minutes",
            type: "Check-up",
            status: "pending",
            location: "Skin Health Clinic",
            address: "789 Wellness Blvd",
            phone: "(555) 345-6789",
            appointmentType: "in-person",
            reason: "Annual skin cancer screening",
            notes: "Wear comfortable clothing",
            insurance: "Covered by Blue Cross",
            copay: "$30",
        },
        {
            id: "APT004",
            doctor: "Dr. Robert Wilson",
            specialty: "Cardiology",
            date: "2024-02-10",
            time: "9:00 AM",
            duration: "60 minutes",
            type: "Procedure",
            status: "confirmed",
            location: "Heart Institute",
            address: "321 Cardiac Way",
            phone: "(555) 456-7890",
            appointmentType: "in-person",
            reason: "Stress test",
            notes: "Wear comfortable shoes and clothing. No caffeine 24 hours before.",
            insurance: "Pre-authorization required",
            copay: "$75",
        },
        {
            id: "APT005",
            doctor: "Dr. Lisa Park",
            specialty: "Family Medicine",
            date: "2024-01-20",
            time: "3:00 PM",
            duration: "30 minutes",
            type: "Telemedicine",
            status: "completed",
            location: "Virtual Visit",
            address: "Online",
            phone: "(555) 567-8901",
            appointmentType: "virtual",
            reason: "Cold symptoms consultation",
            notes: "Prescription sent to pharmacy",
            insurance: "Covered by Blue Cross",
            copay: "$20",
        },
    ]
}

const getUpcomingAppointmentsData = async (): Promise<Appointment[]> => {
    await wait(500)
    return [
        {
            id: "1",
            doctor: "Dr. Sarah Johnson",
            specialty: "Cardiology",
            date: "2024-01-15",
            time: "10:00 AM",
            type: "In-person",
            status: "confirmed",
        },
    ]
}

const getAppointmentDetailsData = async (id: string): Promise<Appointment> => {
    await wait(400)
    return {
        id,
        doctor: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        date: "2024-01-15",
        time: "10:00 AM",
        type: "In-person",
        status: "confirmed",
    }
}

// Query hooks
export const useAppointments = () => {
    return useQuery({
        queryKey: ["appointments"],
        queryFn: getAppointmentsData,
    })
}

export const useUpcomingAppointments = () => {
    return useQuery({
        queryKey: ["upcoming-appointments"],
        queryFn: getUpcomingAppointmentsData,
    })
}

export const useAppointmentDetails = (id: string) => {
    return useQuery({
        queryKey: ["appointment", id],
        queryFn: () => getAppointmentDetailsData(id),
        enabled: !!id,
    })
}

// Service object for direct API calls
export const appointmentService = {
    getAppointments: getAppointmentsData,
    getUpcomingAppointments: getUpcomingAppointmentsData,
    getAppointmentDetails: getAppointmentDetailsData,
} 