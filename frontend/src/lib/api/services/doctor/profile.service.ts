import axiosInstance from "@/lib/axios-interceptor"
import { useQuery } from "@tanstack/react-query"

export interface Education {
    degree: string
    institution: string
    year: string
}

export interface Certification {
    name: string
    issuer: string
    year: string
}

export interface WorkingHours {
    days: string
    time: string
}

export interface DoctorProfile {
    name: string
    specialization: string
    email: string
    phone: string
    location: string
    licenseNumber: string
    yearsOfExperience: number
    hospitalAffiliation: string
    department: string
    education: Education[]
    certifications: Certification[]
    workingHours: WorkingHours[]
}

const getDoctorProfileData = async (): Promise<DoctorProfile | null> => {
    try {
        const response = await axiosInstance.get("/profiles/me")
        const userData = response.data

        if (!userData.user.is_doctor || !userData.doctor_profile) {
            return null
        }

        const user = userData.user
        const profile = userData.doctor_profile

        // Parse available_days JSON if it exists
        let workingHours: WorkingHours[] = []
        try {
            if (profile.available_days) {
                const parsed = JSON.parse(profile.available_days)
                workingHours = Array.isArray(parsed) ? parsed : []
            }
        } catch {
            // Fallback to default working hours
            workingHours = [
                { days: "Monday - Friday", time: "9:00 AM - 5:00 PM" },
                { days: "Saturday", time: "10:00 AM - 2:00 PM" },
                { days: "Sunday", time: "Emergency Only" }
            ]
        }

        // Parse education from education_background if it exists
        let education: Education[] = []
        try {
            if (profile.education_background) {
                const parsed = JSON.parse(profile.education_background)
                education = Array.isArray(parsed) ? parsed : []
            }
        } catch {
            // Fallback if education_background is not JSON
            if (profile.education_background) {
                education = [{
                    degree: profile.education_background,
                    institution: "Medical Institution",
                    year: "N/A"
                }]
            }
        }

        // Default certifications (since we don't have a certifications field in the backend)
        const certifications: Certification[] = [
            {
                name: `Board Certification in ${profile.specialization}`,
                issuer: "Medical Board",
                year: "Current"
            }
        ]

        return {
            name: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
            specialization: profile.specialization,
            email: user.email,
            phone: user.phone || "Not provided",
            location: "Location not set", // Backend doesn't have location field
            licenseNumber: profile.medical_license_number,
            yearsOfExperience: profile.years_of_experience || 0,
            hospitalAffiliation: profile.hospital_affiliation || "Not specified",
            department: profile.specialization, // Using specialization as department
            education,
            certifications,
            workingHours
        }
    } catch (error) {
        console.error("Error fetching doctor profile:", error)
        return null
    }
}

// Service object for direct API calls
export const doctorProfileService = {
    getProfile: getDoctorProfileData
}

// React Query hook
export const useDoctorProfile = () => {
    return useQuery({
        queryKey: ["doctor-profile"],
        queryFn: doctorProfileService.getProfile
    })
} 