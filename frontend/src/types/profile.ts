import { Gender, BloodGroup } from './user'

// Profile Update Types
export interface UserProfileUpdate {
    // User fields
    first_name?: string;
    last_name?: string;
    phone?: string;

    // Patient profile fields
    date_of_birth?: string;
    gender?: Gender;
    blood_group?: BloodGroup;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    address?: string;
    insurance_info?: string;
    allergies?: string;
    medical_history?: string;

    // Doctor profile fields
    medical_license_number?: string;
    license_expiry_date?: string;
    specialization?: string;
    years_of_experience?: number;
    hospital_affiliation?: string;
    education_background?: string;
    consultation_fee?: number;
    available_days?: string;
    bio?: string;
}

export interface PatientProfileUpdate {
    date_of_birth?: string;
    gender?: Gender;
    blood_group?: BloodGroup;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    address?: string;
    insurance_info?: string;
    allergies?: string;
    medical_history?: string;
}

export interface DoctorProfileUpdate {
    medical_license_number?: string;
    license_expiry_date?: string;
    specialization?: string;
    years_of_experience?: number;
    hospital_affiliation?: string;
    education_background?: string;
    consultation_fee?: number;
    available_days?: string;
    bio?: string;
}

// Doctor Search Types
export interface DoctorSearchParams {
    specialization?: string;
    hospital_affiliation?: string;
    min_experience?: number;
    max_fee?: number;
    is_verified?: boolean;
    location?: string;
    name?: string;
    page?: number;
    page_size?: number;
}

export interface DoctorSearchResult {
    id: string;
    user_id: string;
    medical_license_number: string;
    license_expiry_date?: string;
    specialization: string;
    years_of_experience?: number;
    hospital_affiliation?: string;
    education_background?: string;
    consultation_fee?: number;
    available_days?: string;
    bio?: string;
    is_verified: boolean;
    is_license_valid: boolean;
    created_at: string;
    updated_at?: string;
    doctor_name: string;
    doctor_email: string;
}

export interface DoctorSearchResponse {
    doctors: DoctorSearchResult[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// Profile Models
export interface PatientProfile {
    id: string;
    user_id: string;
    date_of_birth?: string;
    gender?: Gender;
    blood_group?: BloodGroup;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    address?: string;
    insurance_info?: string;
    allergies?: string;
    medical_history?: string;
    age?: number;
    created_at: string;
    updated_at: string;
}

export interface DoctorProfile {
    id: string;
    user_id: string;
    medical_license_number: string;
    license_expiry_date?: string;
    specialization: string;
    years_of_experience?: number;
    hospital_affiliation?: string;
    education_background?: string;
    consultation_fee?: number;
    available_days?: string;
    bio?: string;
    is_verified: boolean;
    is_license_valid: boolean;
    created_at: string;
    updated_at: string;
}

// Combined Profile Types
export interface UserWithProfile {
    user: User;
    patient_profile?: PatientProfile;
    doctor_profile?: DoctorProfile;
}

export interface PatientProfileForDoctor {
    id: string
    name: string
    email: string
    phone?:string
    age?: number
    gender?: Gender
    blood_group?: BloodGroup;
    allergies?: string[];
    medical_history?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    address?: string;
    insurance_info?: string;
    date_of_birth?: string;
    is_bookmarked?: boolean;
}

export interface BookmarkPatient{
    patients: PatientProfileForDoctor[]
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// Import User type to avoid circular dependency
import { User } from './user' 