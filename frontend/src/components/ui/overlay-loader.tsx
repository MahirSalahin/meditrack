import { Loader2 } from "lucide-react"
import React from "react"

export function OverlayLoader({ message }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 text-white backdrop-blur-sm">
            <div className="flex flex-col items-center">
                <Loader2 className="animate-spin h-10 w-10" />
                {message && <div className="mt-2 drop-shadow-lg">{message}</div>}
            </div>
        </div>
    )
} 