"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios-interceptor"
import { handleApiErrorWithToast, showSuccessToast } from "@/lib/api-error-handler"
import { UserWithProfile, PatientProfileUpdate } from "@/types/user"
import { queryClient } from "../query-client"

// Profile API functions
export const profileAPI = {
    // Get current user profile
    getCurrentProfile: async (): Promise<UserWithProfile> => {
        const response = await axiosInstance.get<UserWithProfile>("/profiles/me")
        return response.data
    },

    // Update current user profile
    updateProfile: async (data: ProfileUpdateData): Promise<UserWithProfile> => {
        const response = await axiosInstance.put<UserWithProfile>("/profiles/me", data)
        return response.data
    }
}

// Combined update interface for user and profile data
export interface ProfileUpdateData {
    // User fields
    first_name?: string
    last_name?: string
    phone?: string
    
    // Patient profile fields
    date_of_birth?: string
    gender?: string
    blood_group?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    address?: string
    insurance_info?: string
    allergies?: string
    medical_history?: string
}

// React Query hooks
export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: profileAPI.getCurrentProfile,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: profileAPI.updateProfile,
        onSuccess: (data) => {
            // Update cache
            queryClient.setQueryData(["profile"], data)
            
            // Show success message
            showSuccessToast("Profile updated", "Your profile has been updated successfully")
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Profile update failed" })
        },
    })
}
