export enum UserType {
  PATIENT = "patient",
  DOCTOR = "doctor",
  SYSTEM_ADMIN = "system_admin"
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-"
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say"
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  user_type: UserType;
  full_name: string;
  is_patient: boolean;
  is_doctor: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithToken extends User {
  access_token: string;
  token_type: string;
  expires_in: number;
}

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

export interface UserWithProfile extends User {
  patient_profile?: PatientProfile;
  doctor_profile?: DoctorProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface TokenData {
  user_id?: string;
  email?: string;
  user_type?: string;
}

export interface BaseRegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface PatientRegisterRequest extends BaseRegisterRequest {
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

export interface DoctorRegisterRequest extends BaseRegisterRequest {
  medical_license_number: string;
  specialization: string;
  license_expiry_date?: string;
  years_of_experience?: number;
  hospital_affiliation?: string;
  education_background?: string;
  consultation_fee?: number;
  available_days?: string;
  bio?: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  is_verified?: boolean;
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
