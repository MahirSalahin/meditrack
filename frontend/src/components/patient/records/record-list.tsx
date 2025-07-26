"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import {
  FolderOpen,
  Stethoscope,
  TestTube,
  ImageIcon,
  Heart,
  Activity,
  FileText,
  Pencil,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  AlertTriangle,
  Loader2,
  Save,
  X,
} from "lucide-react"
import { useRecordsList, useUpdateRecord, useDeleteRecord } from "@/lib/api/services/patient/record.service"
import { RecordListSkeleton } from "@/components/skeletons/patient/record.skeleton"
import { useState } from "react"
import axiosInstance from "@/lib/axios-interceptor"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { MedicalRecordCreate, MedicalRecordRead } from "@/types/record"

interface RecordListProps {
  searchTerm: string
}

export function RecordList({ searchTerm }: RecordListProps) {
  const { data: records, isLoading, error } = useRecordsList()
  const [loadingAttachmentId, setLoadingAttachmentId] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<MedicalRecordRead | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecordRead | null>(null)
  const { mutate: updateRecord, isPending: isUpdating, error: updateError } = useUpdateRecord()
  const { mutate: deleteRecord, isPending: isDeleting, error: deleteError } = useDeleteRecord()

  const form = useForm({ defaultValues: editingRecord || {} })

  useEffect(() => {
    if (editingRecord) {
      form.reset(editingRecord)
    }
  }, [editingRecord, form])

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Records</h3>
          <p className="text-muted-foreground">Unable to load medical records. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <RecordListSkeleton />
  }

  if (!records || records.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-2">No Records Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "No medical records available yet."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      (record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (record.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (record.tags ? record.tags.toLowerCase().includes(searchTerm.toLowerCase()) : false)

    return matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "checkup":
        return Stethoscope
      case "lab":
        return TestTube
      case "imaging":
        return ImageIcon
      case "specialist":
        return Heart
      case "vaccination":
        return Activity
      case "prescription":
        return FileText
      default:
        return FolderOpen
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "checkup":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "lab":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "imaging":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "specialist":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "vaccination":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "prescription":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (filteredRecords.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-2">No Records Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "No medical records available yet."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleViewAttachment = async (attachmentId: string) => {
    setLoadingAttachmentId(attachmentId)
    try {
      const { data: signedUrl } = await axiosInstance.get<string>(`/records/attachment/${attachmentId}/view`)
      window.open(signedUrl, "_blank")
    } catch {
      alert("Failed to open attachment PDF.")
    } finally {
      setLoadingAttachmentId(null)
    }
  }

  const handleDeleteClick = (record:MedicalRecordRead) => {
    setRecordToDelete(record)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      deleteRecord(recordToDelete.id)
      setDeleteDialogOpen(false)
      setRecordToDelete(null)
    }
  }

  const handleEditSubmit = (data: Partial<MedicalRecordCreate>) => {
    if (!editingRecord?.id) return;
    updateRecord(
      { recordId: editingRecord.id, data },
      {
        onSuccess: () => setEditingRecord(null),
      },
    );
  }

  return (
    <>
      <div className="space-y-6">
        {filteredRecords.map((record) => {
          const IconComponent = getCategoryIcon(record.category)
          const hasAttachment = record.attachments && record.attachments.length > 0
          const firstAttachment = hasAttachment ? record.attachments[0] : null
          const isEditing = editingRecord && editingRecord.id === record.id

          return (
            <Card key={record.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              placeholder="Record title"
                              {...form.register("title", { required: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              placeholder="Category"
                              {...form.register("category", { required: true })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="summary">Summary</Label>
                          <Textarea id="summary" placeholder="Record summary" rows={3} {...form.register("summary")} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="facility">Facility</Label>
                            <Input id="facility" placeholder="Medical facility" {...form.register("facility")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="diagnosis">Diagnosis</Label>
                            <Input id="diagnosis" placeholder="Diagnosis" {...form.register("diagnosis")} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="treatment_summary">Treatment Summary</Label>
                            <Input
                              id="treatment_summary"
                              placeholder="Treatment details"
                              {...form.register("treatment_summary")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Input id="priority" placeholder="Priority level" {...form.register("priority")} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tags">Tags</Label>
                          <Input id="tags" placeholder="Comma-separated tags" {...form.register("tags")} />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button type="submit" disabled={isUpdating} size="sm">
                            {isUpdating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditingRecord(null)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>

                        {updateError && (
                          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {updateError.message}
                          </div>
                        )}
                      </form>
                    ) : (
                      <>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <h3
                              className={`text-lg font-semibold truncate transition-colors ${
                                hasAttachment
                                  ? "text-primary hover:text-primary/80 cursor-pointer"
                                  : "text-muted-foreground cursor-not-allowed"
                              }`}
                              onClick={() => {
                                if (hasAttachment && firstAttachment?.id) {
                                  handleViewAttachment(firstAttachment.id)
                                }
                              }}
                              title={hasAttachment ? "Click to view PDF" : "No attachment"}
                            >
                              {record.title}
                              {loadingAttachmentId === firstAttachment?.id && (
                                <span className="ml-2 text-sm text-muted-foreground font-normal">Loading...</span>
                              )}
                            </h3>
                            <Badge className={getCategoryColor(record.category)}>{record.category}</Badge>
                            {hasAttachment && (
                              <Badge variant="outline" className="text-xs">
                                {loadingAttachmentId === firstAttachment?.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Loading PDF...
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    PDF
                                  </>
                                )}
                              </Badge>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingRecord(record)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(record)}
                                className="text-destructive focus:text-destructive"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Summary */}
                        {record.summary && (
                          <p className="text-muted-foreground mb-4 leading-relaxed">{record.summary}</p>
                        )}

                        {/* Tags */}
                        {record.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {record.tags.split(",").map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Separator className="my-4" />

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {record.record_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(record.record_date).toLocaleDateString()}
                            </div>
                          )}
                          {record.facility && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {record.facility}
                            </div>
                          )}
                          {record.priority && (
                            <Badge variant="outline" className="text-xs">
                              Priority: {record.priority}
                            </Badge>
                          )}
                        </div>

                        {!hasAttachment && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            No attachment available
                          </div>
                        )}

                        {deleteError && (
                          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mt-3">
                            {deleteError.message}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{recordToDelete?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
