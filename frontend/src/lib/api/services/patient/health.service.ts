import axiosInstance from "@/lib/axios-interceptor"
import { HealthMetric } from "./types"
import { useQuery } from "@tanstack/react-query"

// Helper functions for health metrics transformation (reused from dashboard service)
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

// API function to get health metrics
const getHealthMetricsData = async (): Promise<HealthMetric[]> => {
    try {
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
    } catch (error) {
        console.error("Error fetching health metrics:", error)
        return []
    }
}

const getHealthHistoryData = async (metricId: string): Promise<{ date: string; value: string }[]> => {
    console.log(`Fetching health history for metric ID: ${metricId}`)
    // TODO: Implement real API call for health history
    // For now, return empty array since this endpoint isn't implemented yet
    return []
}

// Query hooks
export const useHealthHistory = (metricId: string) => {
    return useQuery({
        queryKey: ["health-history", metricId],
        queryFn: () => getHealthHistoryData(metricId),
        enabled: !!metricId,
    })
}

// Service object for direct API calls
export const healthService = {
    getHealthMetrics: getHealthMetricsData,
    getHealthHistory: getHealthHistoryData,
} 