"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText } from "lucide-react"
import { toast } from "sonner"
import { useUploadPrescription } from "@/lib/api/prescription.service"

interface UploadPrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadPrescriptionDialog({ open, onOpenChange }: UploadPrescriptionDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const { mutateAsync: uploadFile, isPending: uploadingFile } = useUploadPrescription()

  const handleFileSelect = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF or image file (JPG, PNG)");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.(pdf|jpg|jpeg|png)$/i, ""));
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file")
      return
    }

    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    try {
      await uploadFile({
        file: selectedFile,
        title: title.trim(),
      })

      toast.success("PDF uploaded successfully!")
      onOpenChange(false)
      setSelectedFile(null)
      setTitle("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload PDF")
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedFile(null)
    setTitle("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Prescription PDF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>PDF File</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="mx-auto h-8 w-8 text-red-600" />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Drop PDF or image here or click to browse</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG files only (max 10MB)</p>
                  </div>
                </div>
              )}

              <Input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/jpg"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Blood Pressure Medication"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploadingFile}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedFile || !title.trim() || uploadingFile}>
              {uploadingFile ? "Uploading..." : "Upload PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
