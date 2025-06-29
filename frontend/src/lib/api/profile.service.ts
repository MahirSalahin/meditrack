"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios-interceptor"
import { handleApiErrorWithToast, showSuccessToast } from "@/lib/api-error-handler"
import {
    UserWithProfile,
    UserProfileUpdate,
    DoctorSearchParams,
    DoctorSearchResponse,
    DoctorProfile,
    DoctorSearchResult
} from "@/types/profile"
import { queryClient } from "../query-client"

// Profile API functions
export const profileAPI = {
    // Get current user profile
    getCurrentProfile: async (): Promise<UserWithProfile> => {
        const response = await axiosInstance.get<UserWithProfile>("/profiles/me")
        return response.data
    },

    // Update current user profile
    updateProfile: async (data: UserProfileUpdate): Promise<UserWithProfile> => {
        const response = await axiosInstance.put<UserWithProfile>("/profiles/me", data)
        return response.data
    },

    // Search doctors
    searchDoctors: async (params: DoctorSearchParams): Promise<DoctorSearchResponse> => {
        const searchParams = new URLSearchParams()

        // Add all non-undefined parameters to search params
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value.toString())
            }
        })

        const response = await axiosInstance.get<DoctorSearchResponse>(
            `/profiles/doctors/search?${searchParams.toString()}`
        )
        return response.data
    },

    // Get specific doctor profile
    getDoctorProfile: async (doctorId: string): Promise<DoctorProfile> => {
        const response = await axiosInstance.get<DoctorProfile>(`/profiles/doctors/${doctorId}`)
        return response.data
    }
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

export const useSearchDoctors = (params: DoctorSearchParams) => {
    return useQuery({
        queryKey: ["doctors", "search", params],
        queryFn: () => profileAPI.searchDoctors(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: Object.keys(params).length > 0, // Only run if there are search parameters
    })
}

export const useDoctorProfile = (doctorId: string) => {
    return useQuery({
        queryKey: ["doctor", "profile", doctorId],
        queryFn: () => profileAPI.getDoctorProfile(doctorId),
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!doctorId, // Only run if doctorId is provided
    })
}

// Utility functions for cache management
export const invalidateProfileCache = () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] })
}

export const invalidateDoctorSearchCache = () => {
    queryClient.invalidateQueries({ queryKey: ["doctors", "search"] })
}

export const invalidateDoctorProfileCache = (doctorId?: string) => {
    if (doctorId) {
        queryClient.invalidateQueries({ queryKey: ["doctor", "profile", doctorId] })
    } else {
        queryClient.invalidateQueries({ queryKey: ["doctor", "profile"] })
    }
}
