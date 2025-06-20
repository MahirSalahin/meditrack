"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Heart,
  Shield,
  Users,
  ArrowRight,
  Star,
  Clock,
  Stethoscope,
  User,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { logout } from "@/lib/api/auth.service"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove("dark")
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await logout()
  }

  const getDashboardUrl = () => {
    if (!session?.user?.user_type) return "/auth/login"

    switch (session.user.user_type) {
      case "doctor":
        return "/(dashboard)/doctor/dashboard"
      case "patient":
        return "/(dashboard)/patient/dashboard"
      case "system_admin":
        return "/(dashboard)/admin/dashboard"
      default:
        return "/auth/login"
    }
  }

  const getUserInitials = () => {
    if (!session?.user?.first_name || !session?.user?.last_name) return "U"
    return `${session.user.first_name[0]}${session.user.last_name[0]}`.toUpperCase()
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MediTrack</span>
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                // Loading state
                <Skeleton className="size-8 rounded-full" />
              ) : session ? (
                // Authenticated user
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.full_name || "User"} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.full_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardUrl()} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span className="capitalize">{session.user?.user_type} Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Not authenticated
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/doctor">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-6">
              Trusted by 10,000+ Healthcare Professionals
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Health,
              <br />
              <span className="text-blue-600">Simplified & Secure</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Take control of your health journey with our comprehensive digital platform. Track medications, manage
              appointments, and connect with healthcare providers seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {session ? (
                // User is logged in - show dashboard access
                <Link href={getDashboardUrl()}>
                  <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg">
                    <User className="mr-2 h-5 w-5" />
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                // User is not logged in - show registration options
                <>
                  <Link href="/auth/patient">
                    <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg">
                      <Users className="mr-2 h-5 w-5" />
                      Join as Patient
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/doctor">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 text-lg"
                    >
                      <Stethoscope className="mr-2 h-5 w-5" />
                      Join as Doctor
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-sm text-gray-600">Healthcare Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Features Section */}
      <section className="py-20 bg-gray-50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need for better health</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides comprehensive tools to help you manage your health effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Health Tracking</CardTitle>
                <CardDescription>
                  Monitor vital signs, symptoms, and health metrics with easy-to-use tracking tools
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Medication Management</CardTitle>
                <CardDescription>
                  Never miss a dose with smart reminders and comprehensive medication tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>Connect with healthcare providers and manage appointments seamlessly</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section >

      {/* Testimonials */}
      <section className="py-20 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by patients everywhere</h2>
            <p className="text-xl text-gray-600">See what our users have to say about their experience</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                content:
                  "MediTrack has completely transformed how I manage my health. The medication reminders alone have been life-changing.",
              },
              {
                name: "Dr. Michael Chen",
                role: "Cardiologist",
                content:
                  "The platform makes it so easy to track my patients' progress and communicate with them effectively.",
              },
              {
                name: "Emily Rodriguez",
                role: "Patient",
                content:
                  "I love how everything is organized in one place. My medical records, appointments, everything!",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section >

      {/* CTA Section */}
      <section className="py-20 bg-blue-600" >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to take control of your health?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who trust MediTrack for their health management needs
          </p>
          <Link href={session ? getDashboardUrl() : "/auth/doctor"}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
              {session ? "Go to Dashboard" : "Get Started Today"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section >

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-6 w-6" />
                <span className="text-lg font-bold">MediTrack</span>
              </div>
              <p className="text-gray-400">Your trusted partner in digital health management</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediTrack. All rights reserved.</p>
          </div>
        </div>
      </footer >
    </div >
  )
}
