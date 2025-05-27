import { wait } from "@/lib/wait"
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

export const patientApi = {
  async getHealthMetrics(): Promise<HealthMetric[]> {
    await wait(800)
    return [
      {
        id: "1",
        label: "Blood Pressure",
        value: "120/80",
        unit: "mmHg",
        trend: "stable",
        color: "text-red-500",
        icon: "Heart",
      },
      {
        id: "2",
        label: "Heart Rate",
        value: "72",
        unit: "bpm",
        trend: "normal",
        color: "text-blue-500",
        icon: "Activity",
      },
      {
        id: "3",
        label: "Temperature",
        value: "98.6",
        unit: "°F",
        trend: "normal",
        color: "text-orange-500",
        icon: "Thermometer",
      },
    ]
  },

  async getAppointments(): Promise<Appointment[]> {
    await wait(600)
    return [
      {
        id: "1",
        doctor: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        date: "2024-01-15",
        time: "10:00 AM",
        status: "confirmed",
      },
      {
        id: "2",
        doctor: "Dr. Michael Chen",
        specialty: "Dermatology",
        date: "2024-01-18",
        time: "2:30 PM",
        status: "pending",
      },
    ]
  },

  async getMedications(): Promise<Medication[]> {
    await wait(700)
    return [
      {
        id: "1",
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        nextDose: "8:00 AM",
      },
      {
        id: "2",
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        nextDose: "6:00 PM",
      },
    ]
  },

  async getDashboardStats(): Promise<DashboardStats> {
    await wait(500)
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
