export interface HealthMetric {
  id: string
  label: string
  value: string
  unit: string
  trend: "stable" | "normal" | "high" | "low"
  color: string
  icon: string
}

export interface Appointment {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  type: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  duration?: string
  location?: string
  address?: string
  phone?: string
  appointmentType?: "in-person" | "virtual"
  reason?: string
  notes?: string
  insurance?: string
  copay?: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  nextDose: string
  color: string
}

export interface DashboardStats {
  totalActiveUsers: number
  totalInstalled: number
  totalDownloads: number
  activeUsersChange: string
  installedChange: string
  downloadsChange: string
}

export interface Patient {
  id: string
  name: string
  lastVisit: string
  condition: string
  status: "stable" | "monitoring" | "critical"
}

export interface DoctorStats {
  todayAppointments: number
  totalPatients: number
  pendingReviews: number
  avgConsultation: string
}

export interface EmergencyContact {
  id: number
  name: string
  relationship: string
  phone: string
}

export interface Allergy {
  id: number
  allergen: string
  severity: "Severe" | "Moderate" | "Mild"
  reaction: string
}

export interface MedicalCondition {
  id: number
  condition: string
  diagnosedDate: string
  status: "Active" | "Resolved" | "Monitoring"
}

export interface InsuranceInfo {
  provider: string
  policyNumber: string
  groupNumber: string
  memberId: string
}

export interface PatientProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  bloodType: string
  height: string
  weight: string
  memberSince: string
  emergencyContacts: EmergencyContact[]
  allergies: Allergy[]
  medicalConditions: MedicalCondition[]
  insurance: InsuranceInfo
}

export interface MedicationStats {
  activeMedications: number
  adherenceRate: string
  dosesThisWeek: string
  refillsNeeded: number
}

export interface UpcomingDose {
  medication: string
  time: string
  status: "upcoming" | "scheduled" | "missed"
}

export interface MedicationDetails {
  id: string
  name: string
  genericName: string
  dosage: string
  frequency: string
  nextDose: string
  timeLeft: string
  color: string
  status: "active" | "missed"
  prescribedBy: string
  startDate: string
  endDate: string
  instructions: string
  sideEffects: string
  refillsLeft: number
  pharmacy: string
}

export interface MedicationDashboard {
  medications: MedicationDetails[]
  upcomingDoses: UpcomingDose[]
  stats: MedicationStats
}

export interface PrescriptionStats {
  active: number
  pending: number
  totalRefills: number
  total: number
  adherenceRate: string
  nextRefillDue: string
  recentRefills: number
}

export interface PrescriptionRefill {
  id: string
  prescriptionId: string
  requestedDate: string
  status: "pending" | "approved" | "rejected" | "completed"
  processedDate?: string
  pharmacy: string
  notes?: string
}

export interface PrescriptionHistory {
  id: string
  prescriptionId: string
  action: "filled" | "refilled" | "modified" | "cancelled"
  date: string
  performedBy: string
  notes?: string
}

export interface Prescription {
  id: string
  medication: string
  genericName: string
  dosage: string
  quantity: string
  frequency: string
  prescribedBy: string
  prescribedDate: string
  validUntil: string
  status: "active" | "pending" | "completed" | "expired"
  refillsRemaining: number
  totalRefills: number
  pharmacy: string
  instructions: string
  diagnosis: string
  ndc: string
  daw: boolean
  sideEffects: string[]
  contraindications: string[]
  interactions: string[]
  refillHistory: PrescriptionRefill[]
  prescriptionHistory: PrescriptionHistory[]
  lastFilledDate?: string
  nextRefillDate?: string
  adherenceRate?: string
  notes?: string
  attachments?: {
    id: string
    name: string
    type: string
    url: string
    uploadedAt: string
  }[]
}

export interface MedicalRecord {
  id: string
  title: string
  category: "checkup" | "lab" | "imaging" | "specialist" | "vaccination" | "prescription"
  date: string
  doctor: string
  facility: string
  type: string
  fileType: string
  size: string
  summary: string
  tags: string[]
  priority: "high" | "medium" | "normal"
  attachments: number
}

export interface RecordStats {
  total: number
  checkup: number
  lab: number
  imaging: number
  specialist: number
  vaccination: number
  prescription: number
}