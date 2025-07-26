import { useUpdatePrescriptionStatus } from "@/lib/api/prescription.service"
import { useDeletePrescription } from "@/lib/api/prescription.service"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HardDrive, Calendar, FileText, MoreHorizontal, Trash2, CheckCircle } from "lucide-react"
import { PrescriptionPDF } from "@/types/prescription"
import { Badge } from "@/components/ui/badge"
import axiosInstance from "@/lib/axios-interceptor"
import { OverlayLoader } from "@/components/ui/overlay-loader"
import { useState } from "react"
import { PrescriptionStatus } from "@/types/prescription"
import { useSession } from "next-auth/react"

export function PrescriptionCard({ prescription }: { prescription: PrescriptionPDF }) {
  const updateStatusMutation = useUpdatePrescriptionStatus()
  const deleteMutation = useDeletePrescription()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const handleClick = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/prescriptions/pdf/${prescription.id}/view`)
      const url = response.data
      window.open(url, "_blank")
    } catch {
      toast.error("Failed to fetch PDF URL")
    } finally {
      setLoading(false)
    }
  }

  // Only owner can update to any status, doctor can only mark completed -> expired
  const isOwner = session?.user?.id === prescription.uploaded_by
  const canUpdateStatus = isOwner || (session?.user?.is_doctor && prescription.status === PrescriptionStatus.COMPLETED)
  const canDelete = isOwner

  const handleStatusUpdate = async (newStatus:"draft" | "active" | "expired" | "completed") => {
    if (!canUpdateStatus) return
    try {
      await updateStatusMutation.mutateAsync({
        pdf_id: prescription.id,
        status: newStatus,
      })
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async () => {
    if (!canDelete) return
    if (confirm("Are you sure you want to delete this prescription?")) {
      try {
        await deleteMutation.mutateAsync(prescription.id)
        toast.success("Prescription deleted successfully")
      } catch {
        toast.error("Failed to delete prescription")
      }
    }
  }

  return (
    <div className="relative flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
      {
        (loading || updateStatusMutation.isPending || deleteMutation.isPending) &&
        <OverlayLoader message="Loading PDF..." />}
      <div className="flex items-center space-x-4 flex-1 cursor-pointer" onClick={handleClick}>
        <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{prescription.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{prescription.file_name}</p>
        </div>

        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(prescription.created_at).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatFileSize(prescription.file_size)}</span>
          </div>

          <Badge variant={prescription.status} className="capitalize">
            {prescription.status}
          </Badge>
          {prescription.own_prescription && (
            <Badge variant="active" icon={<CheckCircle className="h-3 w-3" />}>Own</Badge>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusUpdate('draft')}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  Mark as Draft
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate('active')}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Mark as Active
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate('completed')}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                  Mark as Completed
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate('expired')}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  Mark as Expired
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              {session?.user.is_doctor && prescription.status === PrescriptionStatus.COMPLETED && (
                <DropdownMenuItem onClick={() => handleStatusUpdate('expired')}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                    Mark as Expired
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div >
  )
}