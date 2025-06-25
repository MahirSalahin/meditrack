import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export const getStatusIcon = (status: string) => {
    switch (status) {
        case "confirmed":
            return <CheckCircle className="h-4 w-4" />
        case "scheduled":
            return <Clock className="h-4 w-4" />
        case "cancelled":
            return <XCircle className="h-4 w-4" />
        case "completed":
            return <CheckCircle className="h-4 w-4" />
        case "in_progress":
            return <AlertCircle className="h-4 w-4" />
        case "no_show":
            return <XCircle className="h-4 w-4" />
        default:
            return <Clock className="h-4 w-4" />
    }
}