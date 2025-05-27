import { wait } from "@/lib/wait"
import { PatientProfile } from "./types"
import { useQuery } from "@tanstack/react-query"

// Static data functions
const getProfileData = async (): Promise<PatientProfile> => {
    await wait(500)
    return {
        id: "PAT-001234",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "(555) 123-4567",
        dateOfBirth: "1985-06-15",
        gender: "Male",
        address: "123 Main Street, Apt 4B, New York, NY 10001",
        bloodType: "O+",
        height: "5'10\"",
        weight: "175 lbs",
        memberSince: "January 2024",
        emergencyContacts: [
            { id: 1, name: "Jane Doe", relationship: "Spouse", phone: "(555) 123-4567" },
            { id: 2, name: "Robert Doe", relationship: "Son", phone: "(555) 234-5678" },
        ],
        allergies: [
            { id: 1, allergen: "Penicillin", severity: "Severe", reaction: "Anaphylaxis" },
            { id: 2, allergen: "Shellfish", severity: "Moderate", reaction: "Hives, swelling" },
        ],
        medicalConditions: [
            { id: 1, condition: "Hypertension", diagnosedDate: "2020-03-15", status: "Active" },
            { id: 2, condition: "Type 2 Diabetes", diagnosedDate: "2019-08-22", status: "Active" },
        ],
        insurance: {
            provider: "Blue Cross Blue Shield",
            policyNumber: "BC123456789",
            groupNumber: "GRP001234",
            memberId: "MEM987654321"
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