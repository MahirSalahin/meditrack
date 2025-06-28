export interface PrescriptionPDF {
    id: string
    prescription_id: string | null
    patient_id: string
    uploaded_by: string
    status: PrescriptionStatus
    title: string
    file_name: string
    file_size: number
    created_at: string
    own_prescription: boolean
}

export interface PrescriptionItem {
    medicationId: string
    dosage: string
    frequency: string
    quantity: string
    duration?: string
    instructions?: string
}

export interface PrescriptionCreate {
    patientId: string
    doctorId?: string
    appointmentId?: string
    startDate: string
    endDate?: string
    diagnosis?: string
    notes?: string
    items: PrescriptionItem[]
}

export interface PrescriptionUpdate {
    startDate?: string
    endDate?: string
    status?: PrescriptionStatus
    diagnosis?: string
    notes?: string
    items?: PrescriptionItem[]
}

export interface PrescriptionRead {
    id: string
    patientId: string
    doctorId: string
    appointmentId?: string
    prescribedDate: string
    startDate: string
    endDate?: string
    diagnosis?: string
    notes?: string
    status: PrescriptionStatus
    items: PrescriptionItem[]
    created_at: Date
    updated_at?: Date
}

export interface PrescriptionStats {
    totalPrescriptions: number;
    draft: number;
    active: number;
    completed: number;
    discontinued: number;
    currentMedications: number;
    medicationLogsCount: number;
}

export enum PrescriptionStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    COMPLETED = "completed",
    DISCONTINUED = "discontinued"
}