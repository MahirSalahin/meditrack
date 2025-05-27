import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, Stethoscope, TestTube, ImageIcon, Heart, Activity, FileText } from "lucide-react"
import { useRecordStats } from "@/lib/api/services/patient/record.service"
import { RecordCategorySkeleton } from "@/components/skeletons/patient/record.skeleton"

interface RecordCategoriesProps {
    selectedCategory: string
    onCategorySelect: (category: string) => void
}

export function RecordCategories({ selectedCategory, onCategorySelect }: RecordCategoriesProps) {
    const { data: stats, isLoading, error } = useRecordStats()

    if (error) {
        return <div>Error loading record categories</div>
    }

    if (isLoading) {
        return <RecordCategorySkeleton />
    }

    if (!stats) return null

    const categories = [
        { key: "all", label: "All Records", icon: FolderOpen, count: stats.total },
        { key: "checkup", label: "Check-ups", icon: Stethoscope, count: stats.checkup },
        { key: "lab", label: "Lab Results", icon: TestTube, count: stats.lab },
        { key: "imaging", label: "Imaging", icon: ImageIcon, count: stats.imaging },
        { key: "specialist", label: "Specialists", icon: Heart, count: stats.specialist },
        { key: "vaccination", label: "Vaccinations", icon: Activity, count: stats.vaccination },
        { key: "prescription", label: "Prescriptions", icon: FileText, count: stats.prescription },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
            {categories.map((category) => {
                const IconComponent = category.icon
                return (
                    <Card
                        key={category.key}
                        className={`cursor-pointer transition-all ${selectedCategory === category.key
                            ? "bg-primary/20 border-2"
                            : "bg-background hover:shadow-md border"
                            }`}
                        onClick={() => onCategorySelect(category.key)}
                    >
                        <CardContent className="p-4 text-center">
                            <div
                                className={`inline-flex p-2 rounded-lg mb-2 ${selectedCategory === category.key ? "bg-primary" : "bg-secondary"
                                    }`}
                            >
                                <IconComponent
                                    className={`h-5 w-5 ${selectedCategory === category.key ? "text-white" : "text-primary"
                                        }`}
                                />
                            </div>
                            <p
                                className={`text-sm font-medium ${selectedCategory === category.key ? "text-primary" : ""
                                    }`}
                            >
                                {category.label}
                            </p>
                            <p className="text-xs text-gray-500">{category.count} records</p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
} 