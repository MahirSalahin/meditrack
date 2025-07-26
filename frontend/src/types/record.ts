export interface MedicalAttachmentRead {
    id: string
    filename: string
    original_filename: string
    file_path: string
    file_type: string
    file_size: number
    content_type: string
    created_at?: string
    updated_at?: string
}

export interface MedicalRecordRead {
    id: string
    patient_id: string
    doctor_id?: string
    title: string
    category: string
    record_date?: string
    facility?: string
    summary?: string
    diagnosis?: string
    symptoms?: string
    treatment_summary?: string
    priority?: string
    tags?: string
    attachments: MedicalAttachmentRead[]
    created_at?: string
    updated_at?: string
}

export type MedicalRecordCreate = Omit<MedicalRecordRead, "id" | "attachments" | "created_at" | "updated_at" | "patient_id" | "doctor_id">;
export type MedicalRecordUpdate = Partial<MedicalRecordCreate>;

export interface RecordStats {
    total: number
    checkup: number
    lab: number
    imaging: number
    specialist: number
    vaccination: number
    prescription: number
} 