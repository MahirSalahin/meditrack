"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Search,
    Bookmark,
    BookmarkIcon,
    User,
    Phone,
    Mail,
    Heart,
    UserCheck,
} from "lucide-react"
import {
    usePatientStats,
    useSearchPatient,
    useBookmarkedPatients,
    useToggleBookmark,
} from "@/lib/api/services/doctor/patients.service"
import {
    PatientStatsSkeleton,
    PatientDetailSkeleton,
    BookmarkListSkeleton
} from "@/components/skeletons/doctor/patients.skeleton"
import TitleHeader from "@/components/title-header"
import { PatientProfileForDoctor } from "@/types"
import Link from "next/link"

// Separate component for search result card
const PatientCard = ({ patient }: { patient: PatientProfileForDoctor }) => {
    const { mutateAsync: toggleBookmark, isPending: togglingBookmark } = useToggleBookmark()

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase()
    }

    return (
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                                {getInitials(patient.name)}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Link href={`/doctor/patients/${patient.id}`} className="text-lg font-semibold text-foreground">
                                    {patient.name}
                                </Link>
                                <Badge variant="outline" className="text-xs">
                                    {patient.id}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {patient.age && (
                                    <span className="flex items-center gap-1">
                                        <UserCheck className="h-3 w-3" />
                                        {patient.age} years
                                    </span>
                                )}
                                {patient.gender && <span>• {patient.gender}</span>}
                                {patient.blood_group && (
                                    <span className="flex items-center gap-1">
                                        <Heart className="h-3 w-3 text-red-500" />
                                        {patient.blood_group}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(patient.id)}
                        disabled={togglingBookmark}
                        className="shrink-0"
                    >
                        {patient.is_bookmarked ? (
                            <Bookmark className="h-4 w-4 fill-primary text-primary" />
                        ) : (
                            <BookmarkIcon className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {patient.email && (
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{patient.email}</span>
                        </div>
                    )}
                    {patient.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{patient.phone}</span>
                        </div>
                    )}
                </div>

                {patient.allergies && patient.allergies.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Allergies</p>
                        <div className="flex flex-wrap gap-1">
                            {patient.allergies.slice(0, 3).map((allergy, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                    {allergy}
                                </Badge>
                            ))}
                            {patient.allergies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{patient.allergies.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function PatientsPage() {
    const [searchId, setSearchId] = useState("")
    const [activePatientId, setActivePatientId] = useState<string | null>(null)
    const [bookmarkSearch, setBookmarkSearch] = useState("")
    const [activeTab, setActiveTab] = useState("search")

    // Queries
    const { data: stats, isLoading: statsLoading } = usePatientStats()
    const { data: searchedPatient, isLoading: searchLoading } = useSearchPatient(activePatientId)
    const { data: bookmarkedPatients, isLoading: bookmarkedLoading } = useBookmarkedPatients()

    const handleSearch = () => {
        if (searchId.trim()) {
            setActivePatientId(searchId.trim())
        }
    }

    const handleClearSearch = () => {
        setSearchId("")
        setActivePatientId(null)
    }

    // Filter bookmarked patients based on search
    const filteredBookmarkedPatients =
        bookmarkedPatients?.patients?.filter(patient =>
            patient.name.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
            (patient.email?.toLowerCase().includes(bookmarkSearch.toLowerCase())) ||
            patient.id.toLowerCase().includes(bookmarkSearch.toLowerCase())
        ) || []

    return (
        <div className="container mx-auto px-4 space-y-6">
            <TitleHeader
                title="Patient Management"
                description="Search patients by ID and manage your bookmarked patients"
            />

            {/* Stats Cards */}
            {statsLoading ? (
                <PatientStatsSkeleton />
            ) : (
                <div className="grid gap-4 md:grid-cols-6">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Total Patients</p>
                            <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Stable</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.stable}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Monitoring</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats?.monitoring}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Critical</p>
                            <p className="text-2xl font-bold text-red-600">{stats?.critical}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">New This Month</p>
                            <p className="text-2xl font-bold text-blue-600">{stats?.newThisMonth}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Bookmarked</p>
                            <p className="text-2xl font-bold text-purple-600">{stats?.bookmarked}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search" className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search Patient
                    </TabsTrigger>
                    <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        My Bookmarks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-6">
                    {/* Search Section */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Search Patient by ID
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Enter Patient ID (e.g., PAT001)"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1"
                                />
                                <Button onClick={handleSearch} disabled={!searchId.trim()}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                                {(searchId || activePatientId) && (
                                    <Button variant="outline" onClick={handleClearSearch}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search Results */}
                    {activePatientId && (
                        <div>
                            {searchLoading ? (
                                <PatientDetailSkeleton />
                            ) : searchedPatient ? (
                                <PatientCard patient={searchedPatient} />
                            ) : (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <User className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">
                                                No patient found with ID: <span className="font-medium">{activePatientId}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Please check the ID and try again
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="bookmarks" className="space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="h-5 w-5" />
                                    My Bookmarked Patients
                                </div>
                                <Badge variant="secondary">
                                    {filteredBookmarkedPatients.length} patients
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search bookmarked patients..."
                                    value={bookmarkSearch}
                                    onChange={(e) => setBookmarkSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {bookmarkedLoading ? (
                                <BookmarkListSkeleton />
                            ) : filteredBookmarkedPatients.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredBookmarkedPatients.map((patient) => (
                                        <PatientCard key={patient.id} patient={patient} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Bookmark className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">
                                        No bookmarked patients yet
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Search for patients and bookmark them to see them here
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}