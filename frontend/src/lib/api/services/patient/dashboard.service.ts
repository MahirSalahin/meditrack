import axiosInstance from "@/lib/axios-interceptor"
import { useQuery } from "@tanstack/react-query"

export interface HealthMetric {
  id: string
  label: string
  value: string
  unit: string
  trend: string
  color: string
  icon: string
}

export interface Appointment {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  status: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  nextDose: string
}

export interface DashboardStats {
  totalActiveUsers: number
  totalInstalled: number
  totalDownloads: number
  activeUsersChange: string
  installedChange: string
  downloadsChange: string
}

// Helper functions for health metrics transformation
function formatVitalTypeLabel(vitalType: string): string {
  const labelMap: Record<string, string> = {
    "BLOOD_PRESSURE": "Blood Pressure",
    "HEART_RATE": "Heart Rate", 
    "TEMPERATURE": "Temperature",
    "WEIGHT": "Weight",
    "HEIGHT": "Height",
    "BMI": "BMI",
    "BLOOD_SUGAR": "Blood Sugar",
    "OXYGEN_SATURATION": "Oxygen Saturation"
  }
  return labelMap[vitalType] || vitalType
}

function calculateTrend(value: string, normalMin?: number, normalMax?: number): string {
  if (!normalMin || !normalMax) return "stable"
  
  // Extract numeric value (handle cases like "120/80" for blood pressure)
  const numericValue = parseFloat(value.split('/')[0])
  if (isNaN(numericValue)) return "stable"
  
  if (numericValue < normalMin) return "low"
  if (numericValue > normalMax) return "high"
  return "normal"
}

function getVitalTypeColor(vitalType: string): string {
  const colorMap: Record<string, string> = {
    "BLOOD_PRESSURE": "text-red-500",
    "HEART_RATE": "text-blue-500",
    "TEMPERATURE": "text-orange-500",
    "WEIGHT": "text-green-500",
    "HEIGHT": "text-purple-500",
    "BMI": "text-indigo-500",
    "BLOOD_SUGAR": "text-yellow-500",
    "OXYGEN_SATURATION": "text-cyan-500"
  }
  return colorMap[vitalType] || "text-gray-500"
}

function getVitalTypeIcon(vitalType: string): string {
  const iconMap: Record<string, string> = {
    "BLOOD_PRESSURE": "Heart",
    "HEART_RATE": "Activity", 
    "TEMPERATURE": "Thermometer",
    "WEIGHT": "Scale",
    "HEIGHT": "Ruler",
    "BMI": "BarChart",
    "BLOOD_SUGAR": "Droplet",
    "OXYGEN_SATURATION": "Wind"
  }
  return iconMap[vitalType] || "Activity"
}

export const patientApi = {
  // Health metrics API call
  async getHealthMetrics(): Promise<HealthMetric[]> {
    const response = await axiosInstance.get("/health-metrics/my/dashboard")
    
    // Transform backend data to match frontend interface
    return response.data.map((metric: any) => ({
      id: metric.id,
      label: formatVitalTypeLabel(metric.metric_type),
      value: metric.value,
      unit: metric.unit,
      trend: calculateTrend(metric.value, metric.normal_min, metric.normal_max),
      color: getVitalTypeColor(metric.metric_type),
      icon: getVitalTypeIcon(metric.metric_type),
    }))
  },

  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await axiosInstance.get("/appointments/my/upcoming?limit=5")
      return response.data.map((appointment: any) => ({
        id: appointment.id,
        doctor: appointment.doctor_name || "Dr. Unknown",
        specialty: appointment.specialty || "General",
        date: new Date(appointment.appointment_date).toLocaleDateString(),
        time: new Date(appointment.appointment_date).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: appointment.status,
      }))
    } catch (error) {
      console.error("Error fetching appointments:", error)
      return []
    }
  },

  async getMedications(): Promise<Medication[]> {
    try {
      const response = await axiosInstance.get("/medications/my/list-items")
      const medications = response.data?.medications || []
      
      return medications.slice(0, 5).map((med: any) => ({
        id: med.id,
        name: med.medication_name,
        dosage: med.dosage,
        frequency: med.frequency,
        nextDose: "Next dose time TBD", // TODO: Calculate next dose time
      }))
    } catch (error) {
      console.error("Error fetching medications:", error)
      return []
    }
  },

  // Note: Dashboard stats endpoint doesn't exist, using mock data
  async getDashboardStats(): Promise<DashboardStats> {
    // TODO: Replace with real API call when dashboard stats endpoint is implemented
    return {
      totalActiveUsers: 18765,
      totalInstalled: 4876,
      totalDownloads: 678,
      activeUsersChange: "+2.6%",
      installedChange: "+0.2%",
      downloadsChange: "-0.1%",
    }
  },
}


export const useHealthMetrics = () => {
  return useQuery({
    queryKey: ["health-metrics"],
    queryFn: patientApi.getHealthMetrics,
  })
}

export const usePatientAppointments = () => {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: patientApi.getAppointments,
  })
}

export const usePatientMedications = () => {
  return useQuery({
    queryKey: ["medications"],
    queryFn: patientApi.getMedications,
  })
}

export const usePatientDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: patientApi.getDashboardStats,
  })
}
