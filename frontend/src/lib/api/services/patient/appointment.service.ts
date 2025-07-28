import { Appointment } from "@/lib/api/services/patient/types"
import axiosInstance from "@/lib/axios-interceptor"
import { useQuery } from "@tanstack/react-query"

// API function to get appointments
const getAppointmentsData = async (): Promise<Appointment[]> => {
    try {
        const response = await axiosInstance.get("/appointments/my/upcoming")
        return response.data.map((appointment: any) => ({
            id: appointment.id,
            doctor: appointment.doctor_name || "Dr. Unknown",
            specialty: appointment.specialty || "General",
            date: new Date(appointment.appointment_date).toISOString().split('T')[0],
            time: new Date(appointment.appointment_date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            duration: "30 minutes", // Default duration, not available in current schema
            type: appointment.appointment_type || "General",
            status: appointment.status,
            location: appointment.location || "Medical Center",
            address: appointment.address || "Address not provided",
            phone: appointment.phone || "Phone not provided",
            appointmentType: "in-person", // Default, not available in current schema
            reason: appointment.reason || "No reason provided",
            notes: appointment.notes || "No additional notes",
            insurance: "To be determined", // Not available in current schema
            copay: "To be determined", // Not available in current schema
        }))
    } catch (error) {
        console.error("Error fetching appointments:", error)
        return []
    }
}

const getUpcomingAppointmentsData = async (): Promise<Appointment[]> => {
    // Use the same API as the main getAppointmentsData function
    return getAppointmentsData()
}

const getAppointmentDetailsData = async (id: string): Promise<Appointment> => {
    try {
        const response = await axiosInstance.get(`/appointments/${id}`)
        const appointment = response.data
        
        return {
            id: appointment.id,
            doctor: appointment.doctor_name || "Dr. Unknown",
            specialty: appointment.specialty || "General",
            date: new Date(appointment.appointment_date).toISOString().split('T')[0],
            time: new Date(appointment.appointment_date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            duration: "30 minutes",
            type: appointment.appointment_type || "General",
            status: appointment.status,
            location: appointment.location || "Medical Center",
            address: appointment.address || "Address not provided",
            phone: appointment.phone || "Phone not provided",
            appointmentType: "in-person",
            reason: appointment.reason || "No reason provided",
            notes: appointment.notes || "No additional notes",
            insurance: "To be determined",
            copay: "To be determined",
        }
    } catch (error) {
        console.error(`Error fetching appointment ${id}:`, error)
        throw error
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