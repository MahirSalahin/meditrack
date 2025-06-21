// Appointment Enums
export enum AppointmentStatus {
    SCHEDULED = "scheduled",
    CONFIRMED = "confirmed",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}

export enum AppointmentType {
    CONSULTATION = "consultation",
    FOLLOW_UP = "follow_up",
    CHECKUP = "checkup",
    EMERGENCY = "emergency",
    VIRTUAL = "virtual"
}

// Base Types
export interface TimestampSchema {
    created_at: string;
    updated_at: string;
}

// Base Appointment Types
export interface AppointmentBase {
    appointment_date: string; // ISO datetime string
    duration_minutes?: number; // Made optional since doctor sets it later
    appointment_type: AppointmentType;
    reason?: string;
    notes?: string;
    meeting_link?: string;
    meeting_id?: string;
    consultation_fee?: number;
}

export interface AppointmentCreate extends AppointmentBase {
    status?: AppointmentStatus;
    doctor_id: string;
    patient_id?: string; // Set by middleware for patients
}

export interface AppointmentUpdate {
    appointment_date?: string;
    duration_minutes?: number;
    appointment_type?: AppointmentType;
    status?: AppointmentStatus;
    reason?: string;
    notes?: string;
    prescription_given?: boolean;
    follow_up_required?: boolean;
    follow_up_date?: string;
    meeting_link?: string;
    meeting_id?: string;
    consultation_fee?: number;
    payment_status?: string;
}

export interface AppointmentRead extends AppointmentBase, TimestampSchema {
    id: string;
    patient_id: string;
    doctor_id: string;
    status: AppointmentStatus;
    prescription_given: boolean;
    follow_up_required: boolean;
    follow_up_date?: string;
    payment_status?: string;
}

// Appointment with related data
export interface AppointmentWithDetails extends AppointmentRead {
    patient_name?: string;
    doctor_name?: string;
    doctor_specialization?: string;
}

// Search and Filter Types
export interface AppointmentSearchFilters {
    doctor_id?: string;
    patient_id?: string;
    status?: AppointmentStatus;
    appointment_type?: AppointmentType;
    date_from?: string;
    date_to?: string;
    specialization?: string;
    doctor_name?: string;
    limit?: number;
    offset?: number;
}

// Appointment Reminder Types
export interface AppointmentReminderBase {
    reminder_time: string;
    reminder_type: 'email' | 'sms' | 'push';
}

export interface AppointmentReminderCreate extends AppointmentReminderBase {
    appointment_id: string;
}

export interface AppointmentReminderRead extends AppointmentReminderBase, TimestampSchema {
    id: string;
    appointment_id: string;
    is_sent: boolean;
    sent_at?: string;
}

// Batch operations
export interface AppointmentBatchUpdate {
    appointment_ids: string[];
    status?: AppointmentStatus;
    notes?: string;
}

// Stats and Analytics
export interface AppointmentStats {
    total_appointments: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    no_show: number;
    upcoming_count: number;
    today_count: number;
}

// API Response Types
export interface AppointmentListResponse {
    appointments: AppointmentWithDetails[];
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface AppointmentResponse {
    appointment: AppointmentWithDetails;
}

export interface AppointmentCreateResponse {
    appointment: AppointmentRead;
    message: string;
}

export interface AppointmentUpdateResponse {
    appointment: AppointmentRead;
    message: string;
}

export interface AppointmentDeleteResponse {
    message: string;
}

// Form Types for UI
export interface AppointmentFormData {
    doctor_id: string;
    appointment_date: string;
    duration_minutes: number;
    appointment_type: AppointmentType;
    reason?: string;
    notes?: string;
    meeting_link?: string;
    meeting_id?: string;
    consultation_fee?: number;
}

export interface AppointmentFilterFormData {
    status?: AppointmentStatus;
    appointment_type?: AppointmentType;
    date_from?: string;
    date_to?: string;
    doctor_name?: string;
    specialization?: string;
}

// Calendar and Schedule Types
export interface AppointmentCalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    status: AppointmentStatus;
    type: AppointmentType;
    patient_name?: string;
    doctor_name?: string;
    color?: string;
}

export interface AppointmentTimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
    appointment_id?: string;
}

export interface DoctorAvailability {
    doctor_id: string;
    doctor_name: string;
    specialization?: string;
    available_slots: AppointmentTimeSlot[];
}

// Notification and Reminder Types
export interface AppointmentReminderFormData {
    appointment_id: string;
    reminder_time: string;
    reminder_type: 'email' | 'sms' | 'push';
}

// Dashboard and Analytics Types
export interface AppointmentDashboardData {
    stats: AppointmentStats;
    recent_appointments: AppointmentWithDetails[];
    upcoming_appointments: AppointmentWithDetails[];
    today_appointments: AppointmentWithDetails[];
}

export interface AppointmentAnalytics {
    appointments_by_status: Record<AppointmentStatus, number>;
    appointments_by_type: Record<AppointmentType, number>;
    appointments_by_month: Array<{
        month: string;
        count: number;
    }>;
    average_duration: number;
    completion_rate: number;
}

// Error Types
export interface AppointmentError {
    message: string;
    field?: string;
    code?: string;
}

export interface AppointmentValidationError {
    errors: AppointmentError[];
}

// Utility Types
export type AppointmentStatusFilter = AppointmentStatus | 'all';
export type AppointmentTypeFilter = AppointmentType | 'all';

export interface AppointmentFilters {
    status: AppointmentStatusFilter;
    type: AppointmentTypeFilter;
    date_range?: {
        start: string;
        end: string;
    };
    doctor_id?: string;
    patient_id?: string;
}
