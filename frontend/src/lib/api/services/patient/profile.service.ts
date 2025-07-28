import axiosInstance from "@/lib/axios-interceptor"
import { PatientProfile } from "./types"
import { useQuery } from "@tanstack/react-query"

// API function to get profile data
const getProfileData = async (): Promise<PatientProfile> => {
    try {
        const response = await axiosInstance.get("/profiles/me")
        const profile = response.data
        
        return {
            id: profile.id,
            firstName: profile.first_name || "Unknown",
            lastName: profile.last_name || "User",
            email: profile.email || "No email provided",
            phone: profile.phone || "No phone provided",
            dateOfBirth: profile.date_of_birth || "Not provided",
            gender: profile.gender || "Not specified",
            address: profile.address || "No address provided",
            bloodType: profile.blood_type || "Unknown",
            height: `${profile.height || "Unknown"} cm`,
            weight: `${profile.weight || "Unknown"} kg`, 
            memberSince: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "Unknown",
            emergencyContacts: profile.emergency_contacts || [],
            allergies: profile.allergies || [],
            medicalConditions: profile.medical_conditions || [],
            insurance: {
                provider: profile.insurance_provider || "No insurance provided",
                policyNumber: profile.policy_number || "N/A",
                groupNumber: profile.group_number || "N/A",
                memberId: profile.member_id || "N/A"
            }
        }
    } catch (error) {
        console.error("Error fetching profile:", error)
        // Fallback profile
        return {
            id: "unknown",
            firstName: "Unknown",
            lastName: "User",
            email: "No email provided",
            phone: "No phone provided",
            dateOfBirth: "Not provided",
            gender: "Not specified",
            address: "No address provided",
            bloodType: "Unknown",
            height: "Unknown",
            weight: "Unknown",
            memberSince: "Unknown",
            emergencyContacts: [],
            allergies: [],
            medicalConditions: [],
            insurance: {
                provider: "No insurance provided",
                policyNumber: "N/A",
                groupNumber: "N/A",
                memberId: "N/A"
            }
        }
    }
}

// Query hooks
export const useProfile = () => {
    return useQuery({
        queryKey: ["patient-profile"],
        queryFn: getProfileData,
    })
}

export const profileService = {
    getProfile: getProfileData,
} 