"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Edit, Save, Camera, X, Phone, Heart } from "lucide-react"
import { useProfile, useUpdateProfile } from "@/lib/api/profile.service"
import { ProfileSkeleton } from "@/components/skeletons/patient/profile.skeleton"
import TitleHeader from "@/components/title-header"
import { BloodGroup, Gender, UserProfileUpdate } from "@/types/user"
import { format } from "date-fns"

// Helper function to safely format dates
const formatDate = (dateString: string | null | undefined, formatStr: string): string => {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""
  return format(date, formatStr)
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: profileData, isLoading, error } = useProfile()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<UserProfileUpdate>()

  // Extract user and patient profile data
  const user = profileData?.user
  const patientProfile = profileData?.patient_profile

  // Set form values when data loads
  useEffect(() => {
    if (user && patientProfile) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || "",
        date_of_birth: formatDate(patientProfile.date_of_birth, "yyyy-MM-dd"),
        gender: patientProfile.gender,
        blood_group: patientProfile.blood_group,
        emergency_contact_name: patientProfile.emergency_contact_name || "",
        emergency_contact_phone: patientProfile.emergency_contact_phone || "",
        address: patientProfile.address || "",
        insurance_info: patientProfile.insurance_info || "",
        allergies: patientProfile.allergies || "",
        medical_history: patientProfile.medical_history || "",
      })
    }
  }, [user, patientProfile, reset])

  const onSubmit = async (data: UserProfileUpdate) => {
    await updateProfile.mutateAsync(data)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user && patientProfile) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || "",
        date_of_birth: formatDate(patientProfile.date_of_birth, "yyyy-MM-dd"),
        gender: patientProfile.gender,
        blood_group: patientProfile.blood_group,
        emergency_contact_name: patientProfile.emergency_contact_name || "",
        emergency_contact_phone: patientProfile.emergency_contact_phone || "",
        address: patientProfile.address || "",
        insurance_info: patientProfile.insurance_info || "",
        allergies: patientProfile.allergies || "",
        medical_history: patientProfile.medical_history || "",
      })
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <TitleHeader title="Profile" description="Manage your profile information" />
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-destructive">Error loading profile: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <TitleHeader title="Profile" description="Manage your profile information" />
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No profile data found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader
          title="Profile"
          description="Manage your profile information"
        />
        <div className="flex gap-2">
          {isEditing && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateProfile.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            onClick={isEditing ? handleSubmit(onSubmit) : () => setIsEditing(true)}
            disabled={updateProfile.isPending}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Personal Information</CardTitle>
              <CardDescription className="text-muted-foreground">Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {user.full_name}
                  </h3>
                  <p className="text-muted-foreground">Patient ID: {patientProfile?.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(user.created_at, "MMMM yyyy") || "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`px-2 py-1 text-xs rounded-full ${user.is_verified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {user.is_verified ? "Verified" : "Pending Verification"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-foreground">First Name</Label>
                  <Input
                    id="first_name"
                    {...register("first_name", { required: "First name is required" })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-foreground">Last Name</Label>
                  <Input
                    id="last_name"
                    {...register("last_name", { required: "Last name is required" })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-foreground">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register("date_of_birth")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground">Gender</Label>
                  <Select
                    value={watch("gender") || ""}
                    onValueChange={(value) => setValue("gender", value as Gender)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Male</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                      <SelectItem value={Gender.OTHER}>Other</SelectItem>
                      <SelectItem value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Address</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  rows={3}
                  placeholder="Enter your full address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Medical Information</CardTitle>
              <CardDescription className="text-muted-foreground">Your health details and medical history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="blood_group" className="text-foreground">Blood Type</Label>
                  <Select
                    value={watch("blood_group") || ""}
                    onValueChange={(value) => setValue("blood_group", value as BloodGroup)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BloodGroup.A_POSITIVE}>A+</SelectItem>
                      <SelectItem value={BloodGroup.A_NEGATIVE}>A-</SelectItem>
                      <SelectItem value={BloodGroup.B_POSITIVE}>B+</SelectItem>
                      <SelectItem value={BloodGroup.B_NEGATIVE}>B-</SelectItem>
                      <SelectItem value={BloodGroup.AB_POSITIVE}>AB+</SelectItem>
                      <SelectItem value={BloodGroup.AB_NEGATIVE}>AB-</SelectItem>
                      <SelectItem value={BloodGroup.O_POSITIVE}>O+</SelectItem>
                      <SelectItem value={BloodGroup.O_NEGATIVE}>O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Age</Label>
                  <Input
                    value={patientProfile?.age ? `${patientProfile.age} years` : "Not calculated"}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-foreground">Allergies</Label>
                <Textarea
                  id="allergies"
                  {...register("allergies")}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  rows={3}
                  placeholder="List any known allergies..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_history" className="text-foreground">Medical History</Label>
                <Textarea
                  id="medical_history"
                  {...register("medical_history")}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  rows={4}
                  placeholder="Describe your medical history..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Contact information for emergencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name" className="text-foreground">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  {...register("emergency_contact_name")}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  placeholder="Emergency contact name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone" className="text-foreground">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  {...register("emergency_contact_phone")}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Insurance Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your insurance details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="insurance_info" className="text-foreground">Insurance Details</Label>
                <Textarea
                  id="insurance_info"
                  {...register("insurance_info")}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  rows={4}
                  placeholder="Insurance provider, policy number, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <div className={`px-2 py-1 text-xs rounded-full ${user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <div className={`px-2 py-1 text-xs rounded-full ${user.is_verified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {user.is_verified ? "Verified" : "Pending"}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">User Type</span>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {user.user_type}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}