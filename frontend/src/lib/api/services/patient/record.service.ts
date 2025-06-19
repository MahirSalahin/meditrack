import { wait } from "@/lib/wait"
import { MedicalRecord, RecordStats } from "./types"
import { useQuery } from "@tanstack/react-query"

const getRecordStatsData = async (): Promise<RecordStats> => {
    await wait(500)
    return {
        total: 6,
        checkup: 1,
        lab: 1,
        imaging: 1,
        specialist: 1,
        vaccination: 1,
        prescription: 1
    }
}

const getRecordsListData = async (): Promise<MedicalRecord[]> => {
    await wait(700)
    return [
        {
            id: "MR001",
            title: "Annual Physical Examination",
            category: "checkup",
            date: "2024-01-15",
            doctor: "Dr. Sarah Johnson",
            facility: "City Medical Center",
            type: "Report",
            fileType: "PDF",
            size: "2.4 MB",
            summary: "Comprehensive annual physical examination with normal findings. Blood pressure, heart rate, and basic metabolic panel all within normal limits.",
            tags: ["Physical", "Annual", "Normal"],
            priority: "normal",
            attachments: 3,
        },
        {
            id: "MR002",
            title: "Blood Test Results - Lipid Panel",
            category: "lab",
            date: "2024-01-10",
            doctor: "Dr. Sarah Johnson",
            facility: "LabCorp",
            type: "Lab Result",
            fileType: "PDF",
            size: "1.2 MB",
            summary: "Lipid panel showing slightly elevated cholesterol levels. Total cholesterol: 220 mg/dL. Recommend dietary modifications.",
            tags: ["Blood Test", "Cholesterol", "Elevated"],
            priority: "medium",
            attachments: 1,
        },
        {
            id: "MR003",
            title: "Chest X-Ray",
            category: "imaging",
            date: "2024-01-08",
            doctor: "Dr. Michael Chen",
            facility: "Radiology Associates",
            type: "Imaging",
            fileType: "DICOM",
            size: "15.6 MB",
            summary: "Chest X-ray performed for routine screening. No acute cardiopulmonary abnormalities detected. Heart size normal.",
            tags: ["X-Ray", "Chest", "Normal"],
            priority: "normal",
            attachments: 2,
        },
        {
            id: "MR004",
            title: "Cardiology Consultation",
            category: "specialist",
            date: "2023-12-20",
            doctor: "Dr. Robert Wilson",
            facility: "Heart Institute",
            type: "Consultation",
            fileType: "PDF",
            size: "3.1 MB",
            summary: "Cardiology consultation for chest pain evaluation. EKG normal. Stress test recommended for further evaluation.",
            tags: ["Cardiology", "Chest Pain", "EKG"],
            priority: "high",
            attachments: 4,
        },
        {
            id: "MR005",
            title: "Vaccination Record - COVID-19 Booster",
            category: "vaccination",
            date: "2023-11-15",
            doctor: "Dr. Sarah Johnson",
            facility: "City Medical Center",
            type: "Vaccination",
            fileType: "PDF",
            size: "0.8 MB",
            summary: "COVID-19 booster vaccination administered. No adverse reactions reported. Next booster due in 6 months.",
            tags: ["Vaccination", "COVID-19", "Booster"],
            priority: "normal",
            attachments: 1,
        },
        {
            id: "MR006",
            title: "Prescription History - Diabetes Management",
            category: "prescription",
            date: "2023-10-30",
            doctor: "Dr. Michael Chen",
            facility: "Endocrine Clinic",
            type: "Prescription",
            fileType: "PDF",
            size: "1.5 MB",
            summary: "Updated diabetes management plan with Metformin dosage adjustment. HbA1c improved to 6.8%. Continue current regimen.",
            tags: ["Diabetes", "Metformin", "HbA1c"],
            priority: "medium",
            attachments: 2,
        },
    ]
}

export const useRecordStats = () => {
    return useQuery({
        queryKey: ["record-stats"],
        queryFn: getRecordStatsData,
    })
}

export const useRecordsList = () => {
    return useQuery({
        queryKey: ["records-list"],
        queryFn: getRecordsListData,
    })
}
