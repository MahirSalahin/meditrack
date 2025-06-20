"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios-interceptor"
import { handleApiErrorWithToast, showSuccessToast } from "@/lib/api-error-handler"
import {
    User,
    Token,
    LoginRequest,
    PatientRegisterRequest,
    DoctorRegisterRequest,
} from "@/types/user"
import { signIn, SignInResponse, signOut } from "next-auth/react"

// Auth API functions using axios
export const authAPI = {
    // Login for all user types
    login: async (data: LoginRequest): Promise<SignInResponse> => {
        const response = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        })
        return response as SignInResponse
    },

    // Register patient
    registerPatient: async (data: PatientRegisterRequest): Promise<Token> => {
        const response = await axiosInstance.post<Token>("/auth/register/patient", data)

        if (response.status < 400) {
            await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: true,
            })
        }

        return response.data
    },

    // Register doctor
    registerDoctor: async (data: DoctorRegisterRequest): Promise<Token> => {
        const response = await axiosInstance.post<Token>("/auth/register/doctor", data)

        if (response.status < 400) {
            await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: true,
            })
        }

        return response.data
    },

    // Get current user profile
    getCurrentUser: async (): Promise<User> => {
        const response = await axiosInstance.get<User>("/auth/me")
        return response.data
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post("/auth/logout")
        } catch (error) {
            // Don't throw error for logout, just clear local storage
            console.warn("Logout API call failed:", error)
        }
    },
}

// React Query hooks
export const useLogin = () => {
    return useMutation({
        mutationFn: authAPI.login,
        onSuccess: async (data) => {
            if (data.error) {
                let message = "An unexpected error occurred. Please try again."
                if (data.error === "CredentialsSignin") {
                    message = "Invalid email or password"
                }

                handleApiErrorWithToast(new Error(message), { title: "Login failed", description: message })
                return;
            }
            // Show success message
            showSuccessToast("Login successful", `Welcome back!`)
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Login failed" })
        },
    })
}

export const useRegisterPatient = () => {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: authAPI.registerPatient,
        onSuccess: () => {
            // Invalidate and refetch user data
            queryClient.invalidateQueries({ queryKey: ["user"] })

            // Show success message
            showSuccessToast("Account created successfully", "Welcome to MediTrack!")

            router.push("/patient/dashboard")
        },
        onError: (error) => {
            handleApiErrorWithToast(error)
        },
    })
}

export const useRegisterDoctor = () => {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: authAPI.registerDoctor,
        onSuccess: () => {
            // Invalidate and refetch user data
            queryClient.invalidateQueries({ queryKey: ["user"] })

            // Show success message
            showSuccessToast("Account created successfully", "Welcome to MediTrack!")

            // Redirect to doctor dashboard
            router.push("/doctor/dashboard")
        },
        onError: (error) => {
            handleApiErrorWithToast(error, { title: "Registration failed" })
        },
    })
}

// Logout function
export const logout = async () => {
    try {
        await authAPI.logout()
    } catch (error) {
        console.warn("Logout API call failed:", error)
    } finally {
        showSuccessToast("Logged out successfully")
        await signOut({
            redirectTo: "/auth/login",
        })
    }
}