import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios-interceptor"
import type { MedicationsListResponse, MedicationsStatsResponse } from "@/types/medication"

export const getMedicationsList = async (): Promise<MedicationsListResponse> => {
    const response = await axiosInstance.get("/medications/my/list-items")
    return response.data
}

export const getMedicationsStats = async (): Promise<MedicationsStatsResponse> => {
    const response = await axiosInstance.get("/medications/my/stats")
    return response.data
}

export const useMedicationsList = () => useQuery({
    queryKey: ["medications-list"],
    queryFn: getMedicationsList,
})

export const useMedicationsStats = () => useQuery({
    queryKey: ["medications-stats"],
    queryFn: getMedicationsStats,
})