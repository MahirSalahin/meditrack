import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Share2,
    Clock,
    Pill,
    User,
    Building2,
    FileText,
    AlertTriangle,
    History,
    FileDown,
    RefreshCw,
} from "lucide-react"
import { Prescription } from "@/lib/api/services/patient/types"
import { useRequestRefill, useDownloadPrescription, useSharePrescription } from "@/lib/api/services/patient/prescription.service"
import { toast } from "sonner"

interface PrescriptionCardProps {
    prescription: Prescription
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
    const requestRefill = useRequestRefill()
    const downloadPrescription = useDownloadPrescription()
    const sharePrescription = useSharePrescription()

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "completed":
                return "bg-blue-100 text-blue-800"
            case "expired":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const handleRefillRequest = async () => {
        try {
            await requestRefill.mutateAsync(prescription.id)
            toast.success("Refill request submitted successfully")
        } catch (error) {
            toast.error(JSON.stringify(error))
        }
    }

    const handleDownload = async () => {
        try {
            const url = await downloadPrescription.mutateAsync(prescription.id)
            window.open(url, "_blank")
        } catch (error) {
            toast.error(JSON.stringify(error))
        }
    }

    const handleShare = async () => {
        try {
            await sharePrescription.mutateAsync({
                prescriptionId: prescription.id,
                doctorId: "current-doctor-id" // This should be replaced with actual doctor ID
            })
            toast.success("Prescription shared successfully")
        } catch (error) {
            toast.error(JSON.stringify(error))
        }
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold">
                            {prescription.medication}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {prescription.genericName}
                        </p>
                    </div>
                    <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Pill className="mr-2 h-4 w-4" />
                                Dosage
                            </div>
                            <p>{prescription.dosage}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4" />
                                Frequency
                            </div>
                            <p>{prescription.frequency}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                Prescribed By
                            </div>
                            <p>{prescription.prescribedBy}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Building2 className="mr-2 h-4 w-4" />
                                Pharmacy
                            </div>
                            <p>{prescription.pharmacy}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Instructions and Diagnosis */}
                    <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium">
                            <FileText className="mr-2 h-4 w-4" />
                            Instructions
                        </div>
                        <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                        <div className="flex items-center text-sm font-medium mt-2">
                            <FileText className="mr-2 h-4 w-4" />
                            Diagnosis
                        </div>
                        <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
                    </div>

                    <Separator />

                    {/* Important Information */}
                    <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Important Information
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium mb-1">Side Effects</p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {prescription.sideEffects.map((effect, index) => (
                                        <li key={index}>{effect}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">Contraindications</p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {prescription.contraindications.map((contra, index) => (
                                        <li key={index}>{contra}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* History and Refills */}
                    <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium">
                            <History className="mr-2 h-4 w-4" />
                            History & Refills
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium mb-1">Refill History</p>
                                <ScrollArea className="h-20">
                                    {prescription.refillHistory.map((refill) => (
                                        <div key={refill.id} className="text-sm text-muted-foreground">
                                            <p>Status: {refill.status}</p>
                                            <p>Date: {new Date(refill.requestedDate).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">Prescription History</p>
                                <ScrollArea className="h-20">
                                    {prescription.prescriptionHistory.map((history) => (
                                        <div key={history.id} className="text-sm text-muted-foreground">
                                            <p>Action: {history.action}</p>
                                            <p>Date: {new Date(history.date).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                disabled={downloadPrescription.isPending}
                            >
                                <FileDown className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                disabled={sharePrescription.isPending}
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>
                        {prescription.status === "active" && prescription.refillsRemaining > 0 && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleRefillRequest}
                                disabled={requestRefill.isPending}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Request Refill
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 