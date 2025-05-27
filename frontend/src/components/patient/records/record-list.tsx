import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, FileText, Download, Eye } from "lucide-react"
import { useRecordsList } from "@/lib/api/services/patient/record.service"
import { RecordListSkeleton } from "@/components/skeletons/patient/record.skeleton"
import { FolderOpen, Stethoscope, TestTube, ImageIcon, Heart, Activity } from "lucide-react"

interface RecordListProps {
    searchTerm: string
    selectedCategory: string
}

export function RecordList({ searchTerm, selectedCategory }: RecordListProps) {
    const { data: records, isLoading, error } = useRecordsList()

    if (error) {
        return <div>Error loading records</div>
    }

    if (isLoading) {
        return <RecordListSkeleton />
    }

    if (!records?.length) return null

    const filteredRecords = records.filter((record) => {
        const matchesSearch =
            record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        if (selectedCategory === "all") return matchesSearch
        return matchesSearch && record.category === selectedCategory
    })

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800"
            case "medium":
                return "bg-yellow-100 text-yellow-800"
            case "normal":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

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

    if (filteredRecords.length === 0) {
        return (
            <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-12 text-center">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? "Try adjusting your search terms" : "Upload your first medical record to get started"}
                    </p>
                    <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Upload Record
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {filteredRecords.map((record) => {
                const IconComponent = getCategoryIcon(record.category)
                return (
                    <Card key={record.id} className="shadow-sm border-0">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 rounded-lg bg-primary text-white">
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold">{record.title}</h3>
                                            <Badge className={getPriorityColor(record.priority)}>
                                                {record.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{record.summary}</p>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {record.tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="outline">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs font-medium uppercase">Date</p>
                                    <p className="text-sm font-semibold">{record.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase">Doctor</p>
                                    <p className="text-sm font-semibold">{record.doctor}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase">Facility</p>
                                    <p className="text-sm font-semibold">{record.facility}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase">File Info</p>
                                    <p className="text-sm font-semibold">
                                        {record.fileType} • {record.size}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{record.date}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <User className="h-4 w-4" />
                                        <span>{record.doctor}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <FileText className="h-4 w-4" />
                                        <span>{record.attachments} attachments</span>
                                    </div>
                                </div>
                                <Button size="sm">
                                    Share with Doctor
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
} 