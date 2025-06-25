"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios-interceptor"
import { handleApiErrorWithToast, showSuccessToast } from "@/lib/api-error-handler"
import {
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentRead,
    AppointmentSearchFilters,
    AppointmentStats,
    AppointmentListResponse,
    AppointmentReminderCreate,
    AppointmentReminderRead,
    AppointmentBatchUpdate,
} from "@/types/appointment"

// Appointment API functions using axios
export const appointmentAPI = {
    // Create new appointment
    createAppointment: async (data: AppointmentCreate): Promise<AppointmentRead> => {
        const response = await axiosInstance.post<AppointmentRead>("/appointments/", data)
        return response.data
    },

    // Get appointment by ID
    getAppointment: async (appointmentId: string): Promise<AppointmentRead> => {
        const response = await axiosInstance.get<AppointmentRead>(`/appointments/${appointmentId}`)
        return response.data
    },

    // Update appointment
    updateAppointment: async (appointmentId: string, data: AppointmentUpdate): Promise<AppointmentRead> => {
        const response = await axiosInstance.put<AppointmentRead>(`/appointments/${appointmentId}`, data)
        return response.data
    },

    // Delete/Cancel appointment
    deleteAppointment: async (appointmentId: string): Promise<{ message: string }> => {
        const response = await axiosInstance.delete<{ message: string }>(`/appointments/${appointmentId}`)
        return response.data
    },

    // Search appointments with filters
    searchAppointments: async (filters: AppointmentSearchFilters): Promise<AppointmentListResponse> => {
        const params = new URLSearchParams()

        if (filters.doctor_id) params.append('doctor_id', filters.doctor_id)
        if (filters.patient_id) params.append('patient_id', filters.patient_id)
        if (filters.status) params.append('status', filters.status)
        if (filters.appointment_type) params.append('appointment_type', filters.appointment_type)
        if (filters.date_from) params.append('date_from', filters.date_from)
        if (filters.date_to) params.append('date_to', filters.date_to)
        if (filters.specialization) params.append('specialization', filters.specialization)
        if (filters.doctor_name) params.append('doctor_name', filters.doctor_name)
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.offset) params.append('offset', filters.offset.toString())

        const response = await axiosInstance.get<AppointmentListResponse>(`/appointments/search?${params.toString()}`)
        return response.data
    },

    // Get user's appointments (simplified)
    getMyAppointments: async (limit: number = 20, offset: number = 0): Promise<AppointmentListResponse> => {
        const response = await axiosInstance.get<AppointmentListResponse>(`/appointments/my/list?limit=${limit}&offset=${offset}`)
        return response.data
    },

    // Get upcoming appointments
    getUpcomingAppointments: async (limit: number = 10): Promise<AppointmentRead[]> => {
        const response = await axiosInstance.get<AppointmentRead[]>(`/appointments/my/upcoming?limit=${limit}`)
        return response.data
    },

    // Get appointment statistics
    getAppointmentStats: async (): Promise<AppointmentStats> => {
        const response = await axiosInstance.get<AppointmentStats>("/appointments/my/stats")
        return response.data
    },

    // Batch update appointments
    batchUpdateAppointments: async (data: AppointmentBatchUpdate): Promise<{ message: string; updated: number; failed: number; total: number }> => {
        const response = await axiosInstance.put<{ message: string; updated: number; failed: number; total: number }>("/appointments/batch", data)
        return response.data
    },

    // Create appointment reminder
    createAppointmentReminder: async (appointmentId: string, data: AppointmentReminderCreate): Promise<AppointmentReminderRead> => {
        const response = await axiosInstance.post<AppointmentReminderRead>(`/appointments/${appointmentId}/reminders`, data)
        return response.data
    },

    // Get user's reminders
    getMyReminders: async (limit: number = 50): Promise<AppointmentReminderRead[]> => {
        const response = await axiosInstance.get<AppointmentReminderRead[]>(`/appointments/my/reminders?limit=${limit}`)
        return response.data
    },

    // Delete reminder
    deleteReminder: async (reminderId: string): Promise<{ message: string }> => {
        const response = await axiosInstance.delete<{ message: string }>(`/appointments/reminders/${reminderId}`)
        return response.data
    }
}

// React Query hooks
export const useAppointments = (filters?: AppointmentSearchFilters) => {
    return useQuery({
        queryKey: ["appointments", filters],
        queryFn: () => appointmentAPI.searchAppointments(filters || {}),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useMyAppointments = (limit: number = 20, offset: number = 0) => {
    return useQuery({
        queryKey: ["my-appointments", limit, offset],
        queryFn: () => appointmentAPI.getMyAppointments(limit, offset),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useUpcomingAppointments = (limit: number = 10) => {
    return useQuery({
        queryKey: ["upcoming-appointments", limit],
        queryFn: () => appointmentAPI.getUpcomingAppointments(limit),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export const useAppointmentDetails = (appointmentId: string) => {
    return useQuery({
        queryKey: ["appointment", appointmentId],
        queryFn: () => appointmentAPI.getAppointment(appointmentId),
        enabled: !!appointmentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useAppointmentStats = () => {
    return useQuery({
        queryKey: ["appointment-stats"],
        queryFn: () => appointmentAPI.getAppointmentStats(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export const useMyReminders = (limit: number = 50) => {
    return useQuery({
        queryKey: ["my-reminders", limit],
        queryFn: () => appointmentAPI.getMyReminders(limit),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Mutation hooks
export const useCreateAppointment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: AppointmentCreate) => appointmentAPI.createAppointment(data),
        onSuccess: () => {
            // Invalidate and refetch appointments
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
            queryClient.invalidateQueries({ queryKey: ["upcoming-appointments"] })
            queryClient.invalidateQueries({ queryKey: ["appointment-stats"] })

            showSuccessToast("Appointment created successfully", "Your appointment has been scheduled")
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Failed to create appointment" })
        },
    })
}

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: AppointmentUpdate }) =>
            appointmentAPI.updateAppointment(appointmentId, data),
        onSuccess: (_, { appointmentId }) => {
            // Invalidate and refetch appointments
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
            queryClient.invalidateQueries({ queryKey: ["upcoming-appointments"] })
            queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] })
            queryClient.invalidateQueries({ queryKey: ["appointment-stats"] })

            showSuccessToast("Appointment updated successfully", "Your appointment has been modified")
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Failed to update appointment" })
        },
    })
}

export const useDeleteAppointment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (appointmentId: string) => appointmentAPI.deleteAppointment(appointmentId),
        onSuccess: () => {
            // Invalidate and refetch appointments
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
            queryClient.invalidateQueries({ queryKey: ["upcoming-appointments"] })
            queryClient.invalidateQueries({ queryKey: ["appointment-stats"] })

            showSuccessToast("Appointment cancelled successfully", "Your appointment has been cancelled")
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Failed to cancel appointment" })
        },
    })
}

export const useBatchUpdateAppointments = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: AppointmentBatchUpdate) => appointmentAPI.batchUpdateAppointments(data),
        onSuccess: (data) => {
            // Invalidate and refetch appointments
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
            queryClient.invalidateQueries({ queryKey: ["appointment-stats"] })

            showSuccessToast(
                "Batch update completed",
                `Updated ${data.updated} appointments${data.failed > 0 ? `, ${data.failed} failed` : ''}`
            )
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Failed to update appointments" })
        },
    })
}

export const useCreateAppointmentReminder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: AppointmentReminderCreate }) =>
            appointmentAPI.createAppointmentReminder(appointmentId, data),
        onSuccess: () => {
            // Invalidate and refetch reminders
            queryClient.invalidateQueries({ queryKey: ["my-reminders"] })

            showSuccessToast("Reminder created successfully", "Your appointment reminder has been set")
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Failed to create reminder" })
        },
    })
}

export const useDeleteReminder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (reminderId: string) => appointmentAPI.deleteReminder(reminderId),
        onSuccess: () => {
            // Invalidate and refetch reminders
            queryClient.invalidateQueries({ queryKey: ["my-reminders"] })

            showSuccessToast("Reminder deleted successfully", "Your appointment reminder has been removed")
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Failed to delete reminder" })
        },
    })
}

// Service object for direct API calls (without React Query)
export const appointmentService = {
    createAppointment: appointmentAPI.createAppointment,
    getAppointment: appointmentAPI.getAppointment,
    updateAppointment: appointmentAPI.updateAppointment,
    deleteAppointment: appointmentAPI.deleteAppointment,
    searchAppointments: appointmentAPI.searchAppointments,
    getMyAppointments: appointmentAPI.getMyAppointments,
    getUpcomingAppointments: appointmentAPI.getUpcomingAppointments,
    getAppointmentStats: appointmentAPI.getAppointmentStats,
    batchUpdateAppointments: appointmentAPI.batchUpdateAppointments,
    createAppointmentReminder: appointmentAPI.createAppointmentReminder,
    getMyReminders: appointmentAPI.getMyReminders,
    deleteReminder: appointmentAPI.deleteReminder,
} 