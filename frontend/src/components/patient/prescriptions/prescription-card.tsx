import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Pill,
    User,
    Calendar,
    ArrowRight,
    Clock,
    Building2
} from "lucide-react"
import { Prescription } from "@/lib/api/services/patient/types"
import { useRouter } from "next/navigation"

interface PrescriptionCardProps {
    prescription: Prescription
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
    const router = useRouter()

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

    const handleViewDetails = () => {
        router.push(`/patient/prescriptions/${prescription.id}`)
    }

    return (
        <Card className="w-full hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDetails}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Pill className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                                    <p className="text-sm text-muted-foreground">{prescription.genericName}</p>
                                </div>
                            </div>
                            <Badge className={getStatusColor(prescription.status)}>
                                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{prescription.dosage} - {prescription.frequency}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Dr. {prescription.prescribedBy}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(prescription.prescribedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{prescription.pharmacy}</span>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p className="line-clamp-2">{prescription.instructions}</p>
                        </div>

                        {prescription.status === "active" && prescription.refillsRemaining > 0 && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Badge variant="secondary">
                                    {prescription.refillsRemaining} refills remaining
                                </Badge>
                            </div>
                        )}
                    </div>

                    <Button variant="ghost" size="sm" className="ml-4">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
} 