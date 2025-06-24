"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

interface ConfirmationDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    cancelVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    isLoading?: boolean
    loadingText?: string
    icon?: ReactNode
    size?: "sm" | "md" | "lg"
    itemName?: string
    actionType?: "delete" | "cancel" | "archive" | "confirm" | "custom"
}

export function ConfirmationDialog({
    isOpen,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "destructive",
    cancelVariant = "outline",
    isLoading = false,
    loadingText = "Processing...",
    icon,
    size = "md",
    itemName,
    actionType = "confirm"
}: ConfirmationDialogProps) {
    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm()
        }
    }

    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "max-w-sm"
            case "lg":
                return "max-w-lg"
            default:
                return "max-w-md"
        }
    }

    // Generate default title and description based on action type
    const getDefaultTitle = () => {
        if (title) return title

        const actionLabel = actionType.charAt(0).toUpperCase() + actionType.slice(1)
        const itemLabel = itemName ? itemName.charAt(0).toUpperCase() + itemName.slice(1) : "Item"

        switch (actionType) {
            case "delete":
                return `Delete ${itemLabel}`
            case "cancel":
                return `Cancel ${itemLabel}`
            case "archive":
                return `Archive ${itemLabel}`
            case "confirm":
                return `Confirm Action`
            default:
                return `${actionLabel} ${itemLabel}`
        }
    }

    const getDefaultDescription = () => {
        if (description) return description

        const itemLabel = itemName ? itemName.toLowerCase() : "item"

        switch (actionType) {
            case "delete":
                return `Are you sure you want to delete this ${itemLabel}? This action cannot be undone.`
            case "cancel":
                return `Are you sure you want to cancel this ${itemLabel}? This action cannot be undone.`
            case "archive":
                return `Are you sure you want to archive this ${itemLabel}?`
            case "confirm":
                return "Are you sure you want to proceed with this action?"
            default:
                return `Are you sure you want to ${actionType} this ${itemLabel}?`
        }
    }

    const getDefaultIcon = () => {
        if (icon) return icon

        switch (actionType) {
            case "delete":
                return (
                    <svg className="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                )
            case "cancel":
                return (
                    <svg className="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
            case "archive":
                return (
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-14 0h14" />
                    </svg>
                )
            case "confirm":
                return (
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            default:
                return null
        }
    }

    const getDefaultConfirmText = () => {
        if (confirmText !== "Confirm") return confirmText

        switch (actionType) {
            case "delete":
                return "Delete"
            case "cancel":
                return "Cancel"
            case "archive":
                return "Archive"
            case "confirm":
                return "Confirm"
            default:
                return "Confirm"
        }
    }

    const getDefaultConfirmVariant = () => {
        if (confirmVariant !== "destructive") return confirmVariant

        switch (actionType) {
            case "delete":
            case "cancel":
                return "destructive"
            case "archive":
            case "confirm":
                return "default"
            default:
                return "destructive"
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={getSizeClasses()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getDefaultIcon() && <span className="flex-shrink-0">{getDefaultIcon()}</span>}
                        <span>{getDefaultTitle()}</span>
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        {getDefaultDescription()}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant={cancelVariant}
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={getDefaultConfirmVariant()}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={getDefaultConfirmVariant() === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                    >
                        {isLoading ? loadingText : getDefaultConfirmText()}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Pre-configured variants for common use cases
export function DeleteConfirmationDialog({
    isOpen,
    onOpenChange,
    onConfirm,
    title,
    description,
    itemName,
    isLoading = false,
    loadingText = "Deleting...",
    ...props
}: Omit<ConfirmationDialogProps, 'confirmText' | 'confirmVariant' | 'icon' | 'actionType'> & {
    itemName?: string
}) {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onConfirm={onConfirm}
            title={title}
            description={description}
            itemName={itemName}
            actionType="delete"
            isLoading={isLoading}
            loadingText={loadingText}
            {...props}
        />
    )
}

export function CancelConfirmationDialog({
    isOpen,
    onOpenChange,
    onConfirm,
    title,
    description,
    itemName,
    isLoading = false,
    loadingText = "Cancelling...",
    ...props
}: Omit<ConfirmationDialogProps, 'confirmText' | 'confirmVariant' | 'icon' | 'title' | 'actionType'> & {
    itemName?: string
    title?: string
}) {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onConfirm={onConfirm}
            title={title}
            description={description}
            itemName={itemName}
            actionType="cancel"
            isLoading={isLoading}
            loadingText={loadingText}
            {...props}
        />
    )
}

export function ArchiveConfirmationDialog({
    isOpen,
    onOpenChange,
    onConfirm,
    title,
    description,
    itemName,
    isLoading = false,
    loadingText = "Archiving...",
    ...props
}: Omit<ConfirmationDialogProps, 'confirmText' | 'confirmVariant' | 'icon' | 'actionType'> & {
    itemName?: string
}) {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onConfirm={onConfirm}
            title={title}
            description={description}
            itemName={itemName}
            actionType="archive"
            isLoading={isLoading}
            loadingText={loadingText}
            {...props}
        />
    )
} 