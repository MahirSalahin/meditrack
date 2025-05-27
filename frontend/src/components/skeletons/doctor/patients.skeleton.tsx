import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function PatientCardSkeleton() {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-24" />
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function PatientStatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function PatientsListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <PatientCardSkeleton key={i} />
            ))}
        </div>
    )
} 