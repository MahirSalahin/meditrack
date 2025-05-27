import { wait } from "@/lib/wait"
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

const getDoctorProfileData = async (): Promise<DoctorProfile> => {
    await wait(800)
    return {
        name: "Dr. Sarah Johnson",
        specialization: "Cardiologist",
        email: "sarah.johnson@meditrack.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        licenseNumber: "MD123456",
        yearsOfExperience: 15,
        hospitalAffiliation: "New York Medical Center",
        department: "Cardiology",
        education: [
            {
                degree: "MD - Doctor of Medicine",
                institution: "Harvard Medical School",
                year: "2005-2009"
            },
            {
                degree: "Residency in Internal Medicine",
                institution: "Massachusetts General Hospital",
                year: "2009-2012"
            },
            {
                degree: "Fellowship in Cardiology",
                institution: "Johns Hopkins Hospital",
                year: "2012-2015"
            }
        ],
        certifications: [
            {
                name: "Board Certification in Internal Medicine",
                issuer: "American Board of Internal Medicine",
                year: "2012"
            },
            {
                name: "Board Certification in Cardiovascular Disease",
                issuer: "American Board of Internal Medicine",
                year: "2015"
            },
            {
                name: "Advanced Cardiac Life Support (ACLS)",
                issuer: "American Heart Association",
                year: "2023"
            }
        ],
        workingHours: [
            {
                days: "Monday - Friday",
                time: "9:00 AM - 5:00 PM"
            },
            {
                days: "Saturday",
                time: "10:00 AM - 2:00 PM"
            },
            {
                days: "Sunday",
                time: "Emergency Only"
            }
        ]
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