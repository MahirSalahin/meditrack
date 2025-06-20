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
import { Mail, Lock, Eye, EyeOff, Phone, Heart, User, Calendar, MapPin, AlertTriangle, FileText } from "lucide-react"
import { useRegisterPatient } from "@/lib/api/auth.service"
import { BloodGroup, Gender, PatientRegisterRequest } from "@/types/user"

// Validation schema based on backend PatientRegisterRequest
const schema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    date_of_birth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    blood_group: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    address: z.string().optional(),
    insurance_info: z.string().optional(),
    allergies: z.string().optional(),
    medical_history: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof schema>

export default function PatientAuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const registerMutation = useRegisterPatient()

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      date_of_birth: "",
      gender: undefined,
      blood_group: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      address: "",
      insurance_info: "",
      allergies: "",
      medical_history: "",
      agreeToTerms: false,
    },
  })

  const bloodGroups = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
  ]

  const onSignupSubmit = (data: SignupFormValues) => {
    const registerData: PatientRegisterRequest = {
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || undefined,
      date_of_birth: data.date_of_birth || undefined,
      gender: data.gender as Gender || undefined,
      blood_group: data.blood_group as BloodGroup || undefined,
      emergency_contact_name: data.emergency_contact_name || undefined,
      emergency_contact_phone: data.emergency_contact_phone || undefined,
      address: data.address || undefined,
      insurance_info: data.insurance_info || undefined,
      allergies: data.allergies || undefined,
      medical_history: data.medical_history || undefined,
    }

    registerMutation.mutate(registerData)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center space-y-4 relative">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>

            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">Patient Registration</CardTitle>
              <CardDescription className="text-slate-500 mt-2">Create your health account</CardDescription>
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
                                placeholder="patient@email.com"
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Date of Birth</FormLabel>
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
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11 w-full">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="blood_group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Blood Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bloodGroups.map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact & Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                    Contact & Address Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Textarea
                              placeholder="Enter your full address"
                              className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
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
                      name="emergency_contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter emergency contact name"
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
                      name="emergency_contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Emergency Contact Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Enter emergency contact phone"
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

                {/* Health Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-blue-500" />
                    Health Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="insurance_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Insurance Information</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Textarea
                              placeholder="Enter your insurance details (provider, policy number, etc.)"
                              className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
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
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Allergies</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Textarea
                              placeholder="List any allergies you have (medications, food, environmental, etc.)"
                              className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
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
                    name="medical_history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Medical History</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Textarea
                              placeholder="Enter your medical history (previous conditions, surgeries, etc.)"
                              className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                              {...field}
                            />
                          </div>
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
