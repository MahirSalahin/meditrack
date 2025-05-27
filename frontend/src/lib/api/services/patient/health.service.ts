import { wait } from "@/lib/wait"
import { HealthMetric } from "./types"
import { useQuery } from "@tanstack/react-query"

// Static data functions
const getHealthMetricsData = async (): Promise<HealthMetric[]> => {
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
}

const getHealthHistoryData = async (metricId: string): Promise<{ date: string; value: string }[]> => {
    console.log(`Fetching health history for metric ID: ${metricId}`)
    await wait(600)
    return [
        { date: "2024-01-01", value: "120/80" },
        { date: "2024-01-02", value: "118/78" },
        { date: "2024-01-03", value: "122/82" },
    ]
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