"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { PrescriptionPDF, PrescriptionStats } from "@/types/prescription"
import axiosInstance from "../axios-interceptor"
import { toast } from "sonner"
import { PrescriptionFormValues } from "@/components/doctor/prescriptions/add-prescription-dialog"


export const usePrescriptionStats = () => {
  return useQuery({
    queryKey: ["prescription-stats"],
    queryFn: async (): Promise<PrescriptionStats> => {
      const response = await axiosInstance.get("/prescriptions/my/stats");
      const stats = response.data;
      return {
        totalPrescriptions: stats.total_prescriptions ?? 0,
        draft: stats.draft ?? 0,
        active: stats.active ?? 0,
        completed: stats.completed ?? 0,
        discontinued: stats.discontinued ?? 0,
        currentMedications: stats.current_medications ?? 0,
        medicationLogsCount: stats.medication_logs_count ?? 0,
      };
    },
  });
}

export function usePrescriptionsList() {
  return useQuery({
    queryKey: ["prescriptions"],
    queryFn: async (): Promise<PrescriptionPDF[]> => {
      const response = await axiosInstance.get("/prescriptions/my/pdfs")
      // Map backend fields to frontend camelCase if needed
      return response.data.pdfs
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePrescriptionsListByPatientId(patient_id: string) {
  return useQuery({
    queryKey: ["prescriptions_by_paitents_id"],
    queryFn: async (): Promise<PrescriptionPDF[]> => {
      const response = await axiosInstance.get(`/prescriptions/patients/${patient_id}/pdfs`)
      return response.data.pdfs
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUploadPrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      // Accept PDF or image (JPG, PNG)
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only PDF or image files (JPG, PNG) are allowed");
      }
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      const response = await axiosInstance.post<PrescriptionPDF>("/prescriptions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Prescription uploaded successfully")
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      queryClient.invalidateQueries({ queryKey: ["prescription-pdfs"] })
    },
    onError: (error: Error) => {
      toast.error("Failed to upload prescription", {
        description: error.message,
      })
      console.error("Error uploading prescription:", error)
      throw error
    },
  })
}

export function useCreatePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: PrescriptionFormValues & { patient_id: string }) => {
      const response = await axiosInstance.post<PrescriptionPDF>("/prescriptions", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions_by_paitents_id"] })
      toast.success("Prescription created successfully!")
    },
    onError: (error: Error) => {
      toast.error("Failed to create prescription", {
        description: error.message,
      })
      console.error("Error creating prescription:", error)
      throw error
    },
  })
}

export function usePatientPrescriptionPDFs() {
  return useQuery<{ pdfs: PrescriptionPDF[]; total: number; limit: number; offset: number }>(
    {
      queryKey: ["prescription-pdfs"],
      queryFn: async () => {
        const response = await axiosInstance.get("/prescriptions/my/pdfs")
        return response.data
      },
    }
  )
}


export function useUpdatePrescriptionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pdf_id, status }: { pdf_id: string; status: "draft" | "active" | "expired" | "completed" }) => {
      const response = await axiosInstance.patch(`/prescriptions/pdf/${pdf_id}/status`, { status })
      return response.data
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      toast.success(`Status updated to ${res}`)
    },
  })
}

export function useDeletePrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (prescriptionId: string) => {
      const response = await axiosInstance.delete(`/prescriptions/pdf/${prescriptionId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      toast.success(`Successfully Deleted!`)
    },
  })
}
