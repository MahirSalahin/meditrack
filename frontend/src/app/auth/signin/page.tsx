"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Stethoscope, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "patient"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      toast.success("Signed in successfully!")
      router.push(`/${formData.userType}/dashboard`)
    } catch (error) {
      toast.error(JSON.stringify(error) || "An error occurred while signing in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="h-8 w-8 text-black" />
            <span className="text-2xl font-bold text-black">MediTrack</span>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Welcome to MediTrack</h1>
          <p className="text-gray-600">Your trusted healthcare companion</p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Sign In</CardTitle>
            <CardDescription className="text-center">Access your healthcare dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patient" className="w-full" onValueChange={(value) => setFormData({ ...formData, userType: value })}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
              </TabsList>
              <TabsContent value="patient">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Link href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-black">
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Patient"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="doctor">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Link href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-black">
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Doctor"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Don&#39;t have an account? </span>
              <Link href="/auth/signup" className="text-sm text-gray-600 hover:text-black">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
