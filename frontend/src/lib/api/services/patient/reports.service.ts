import { wait } from "@/lib/wait"
import { useQuery } from "@tanstack/react-query"

export interface TestReport {
    id: string
    testName: string
    testType: "blood" | "urine" | "imaging" | "cardiac" | "other"
    testDate: string
    orderedBy: string
    laboratory: string
    status: "scheduled" | "pending" | "completed" | "cancelled"
    results?: TestResult[]
    summary?: string
    attachments?: {
        id: string
        name: string
        type: string
        url: string
    }[]
}

export interface TestResult {
    parameter: string
    value: string
    unit: string
    referenceRange: string
    status: "normal" | "high" | "low" | "critical"
}

const getTestReportsData = async (): Promise<TestReport[]> => {
    await wait(800)
    return [
        {
            id: "TR001",
            testName: "Complete Blood Count (CBC)",
            testType: "blood",
            testDate: "2024-01-20",
            orderedBy: "Dr. Sarah Johnson",
            laboratory: "City Lab Center",
            status: "completed",
            summary: "All parameters within normal range. No abnormalities detected."
        },
        {
            id: "TR002",
            testName: "Chest X-Ray",
            testType: "imaging",
            testDate: "2024-01-18",
            orderedBy: "Dr. Michael Chen",
            laboratory: "Radiology Department",
            status: "completed",
            summary: "No acute pulmonary abnormalities. Heart size normal."
        },
        {
            id: "TR003",
            testName: "Lipid Panel",
            testType: "blood",
            testDate: "2024-01-25",
            orderedBy: "Dr. Sarah Johnson",
            laboratory: "City Lab Center",
            status: "pending",
            summary: "Results pending"
        }
    ]
}

export const useTestReports = () => {
    return useQuery({
        queryKey: ["test-reports"],
        queryFn: getTestReportsData
    })
}