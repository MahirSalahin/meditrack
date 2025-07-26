import axiosInstance from "@/lib/axios-interceptor"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { MedicalRecordRead, MedicalRecordUpdate, MedicalAttachmentRead, RecordStats } from "@/types/record"

export const getRecordsList = async (): Promise<MedicalRecordRead[]> => {
    const response = await axiosInstance.get("/records/my/list")
    return response.data
}

export const getPatientRecords = async (patientId: string): Promise<MedicalRecordRead[]> => {
    const response = await axiosInstance.get(`/records/patient/${patientId}/list`)
    return response.data
}

export const getRecordAttachment = async (recordId: string, attachmentId: string): Promise<MedicalAttachmentRead> => {
    const response = await axiosInstance.get(`/records/${recordId}/attachment/${attachmentId}`)
    return response.data
}

export const uploadRecord = async (formData: FormData): Promise<MedicalRecordRead> => {
    const response = await axiosInstance.post("/records/my/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
}

export const updateRecord = async (recordId: string, data: MedicalRecordUpdate): Promise<MedicalRecordRead> => {
    const response = await axiosInstance.put(`/records/my/${recordId}`, data)
    return response.data
}

export const deleteRecord = async (recordId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/records/my/${recordId}`)
    return response.data
}

export const getRecordStats = async (): Promise<RecordStats> => {
  const response = await axiosInstance.get("/records/my/stats")
  return response.data
}

export const useRecordsList = () => useQuery({
    queryKey: ["records-list"],
    queryFn: getRecordsList,
})

export const usePatientRecords = (patientId: string) => useQuery({
    queryKey: ["patient-records", patientId],
    queryFn: () => getPatientRecords(patientId),
    enabled: !!patientId,
})

export const useUploadRecord = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: uploadRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["records-list"] })
        },
    })
}

export const useUpdateRecord = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ recordId, data }: { recordId: string; data: MedicalRecordUpdate }) => updateRecord(recordId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["records-list"] })
        },
    })
}

export const useDeleteRecord = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (recordId: string) => deleteRecord(recordId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["records-list"] })
        },
    })
}

export const useRecordStats = () => useQuery({
  queryKey: ["record-stats"],
  queryFn: getRecordStats,
})
