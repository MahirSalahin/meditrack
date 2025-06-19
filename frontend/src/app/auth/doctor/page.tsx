"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Eye, EyeOff, Phone, Stethoscope, User, Building2, Calendar, DollarSign, GraduationCap, Clock } from "lucide-react"
import { useRegisterDoctor } from "@/lib/api/auth.service"
import { DoctorRegisterRequest } from "@/types/user"

// Validation schema based on backend DoctorRegisterRequest
const schema = z
    .object({
        first_name: z.string().min(2, "First name must be at least 2 characters"),
        last_name: z.string().min(2, "Last name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().optional(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        medical_license_number: z.string().min(5, "Please enter a valid medical license number"),
        specialization: z.string().min(1, "Please select your specialization"),
        license_expiry_date: z.string().optional(),
        years_of_experience: z.number().min(0, "Years of experience must be 0 or greater").optional(),
        hospital_affiliation: z.string().optional(),
        education_background: z.string().optional(),
        consultation_fee: z.number().min(0, "Consultation fee must be 0 or greater").optional(),
        available_days: z.string().optional(),
        bio: z.string().optional(),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message: "",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

type SignupFormValues = z.infer<typeof schema>

export default function DoctorAuthPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const registerMutation = useRegisterDoctor()

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            medical_license_number: "",
            specialization: "",
            license_expiry_date: "",
            years_of_experience: 0,
            hospital_affiliation: "",
            education_background: "",
            consultation_fee: 0,
            available_days: "",
            bio: "",
            agreeToTerms: false,
        },
    })

    const specializations = [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "Dermatology",
        "Psychiatry",
        "Oncology",
        "Radiology",
        "Emergency Medicine",
        "Internal Medicine",
        "Surgery",
        "Anesthesiology",
        "Gynecology",
        "Urology",
        "Ophthalmology",
        "ENT",
        "General Practice",
        "Family Medicine",
    ]

    const onSignupSubmit = (data: SignupFormValues) => {
        const registerData: DoctorRegisterRequest = {
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone || undefined,
            medical_license_number: data.medical_license_number,
            specialization: data.specialization,
            license_expiry_date: data.license_expiry_date || undefined,
            years_of_experience: data.years_of_experience || undefined,
            hospital_affiliation: data.hospital_affiliation || undefined,
            education_background: data.education_background || undefined,
            consultation_fee: data.consultation_fee || undefined,
            available_days: data.available_days || undefined,
            bio: data.bio || undefined,
        }

        registerMutation.mutate(registerData)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="text-center space-y-4 relative">
                    <div className="mx-auto w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                        <Stethoscope className="h-8 w-8 text-white" />
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-800">Healthcare Provider Registration</CardTitle>
                        <CardDescription className="text-slate-500 mt-2">Create your professional account</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Error Alert */}
                    {registerMutation.isError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {registerMutation.error instanceof Error
                                    ? registerMutation.error.message
                                    : "Registration failed. Please check your information and try again."}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSignupSubmit)} className="space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-blue-500" />
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">First Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your first name"
                                                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Last Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your last name"
                                                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            placeholder="doctor@hospital.com"
                                                            className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Phone Number</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            placeholder="Enter your phone number"
                                                            className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                    <Stethoscope className="h-5 w-5 mr-2 text-blue-500" />
                                    Professional Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="medical_license_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Medical License Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your license number"
                                                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="specialization"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Specialization</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                                                            <SelectValue placeholder="Select your specialization" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {specializations.map((spec) => (
                                                            <SelectItem key={spec} value={spec}>
                                                                {spec}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="license_expiry_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">License Expiry Date</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            type="date"
                                                            className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="years_of_experience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Years of Experience</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="hospital_affiliation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-medium">Hospital/Clinic Affiliation</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Enter hospital or clinic name"
                                                        className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="education_background"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-medium">Education Background</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Textarea
                                                        placeholder="Enter your educational background"
                                                        className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="consultation_fee"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Consultation Fee</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="available_days"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Available Days</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            placeholder="e.g., Mon-Fri, 9AM-5PM"
                                                            className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-medium">Bio</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us about yourself and your practice"
                                                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Account Security */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                    <Lock className="h-5 w-5 mr-2 text-blue-500" />
                                    Account Security
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Create a strong password"
                                                            className="pl-10 pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-1 top-1 h-9 w-9 p-0 hover:bg-slate-100"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4 text-slate-400" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-slate-400" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm your password"
                                                            className="pl-10 pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-1 top-1 h-9 w-9 p-0 hover:bg-slate-100"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-4 w-4 text-slate-400" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-slate-400" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <FormField
                                control={form.control}
                                name="agreeToTerms"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm text-slate-600">
                                                I agree to the{" "}
                                                <Link href="/terms" className="text-blue-500 hover:text-blue-600 underline">
                                                    Terms of Service
                                                </Link>{" "}
                                                and{" "}
                                                <Link href="/privacy" className="text-blue-500 hover:text-blue-600 underline">
                                                    Privacy Policy
                                                </Link>
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-medium"
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                            </Button>

                            {/* Login link */}
                            <div className="text-center">
                                <p className="text-sm text-slate-600">
                                    Already have an account?{" "}
                                    <Link href="/auth/login" className="text-blue-500 hover:text-blue-600 font-medium">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
} 