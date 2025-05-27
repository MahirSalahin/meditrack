import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Common table skeleton
export function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="rounded-md border">
                <div className="border-b p-4">
                    <div className="flex items-center justify-between">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-[100px]" />
                        ))}
                    </div>
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-0">
                        <div className="flex items-center justify-between">
                            {[...Array(4)].map((_, j) => (
                                <Skeleton key={j} className="h-4 w-[100px]" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Profile card skeleton
export function ProfileCardSkeleton() {
    return (
        <Card>
            <CardHeader className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

// Form skeleton
export function FormSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <Skeleton className="h-10 w-[100px]" />
        </div>
    )
}

// List item skeleton
export function ListItemSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-3 w-[100px]" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-[80px]" />
                </div>
            ))}
        </div>
    )
}

// Page header skeleton
export function PageHeaderSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
        </div>
    )
}

// Grid skeleton
export function GridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-8 w-[100px]" />
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-3 w-3" />
                                <Skeleton className="h-3 w-[100px]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}


