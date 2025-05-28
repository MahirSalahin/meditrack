import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, FileText, Users, Stethoscope, Heart } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-slate-100/50"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-500/3 rounded-full blur-lg"></div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">MediTrack</h1>
          <p className="text-slate-600 text-lg">Your Digital Health Companion</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-slate-800">Get Started</CardTitle>
            <CardDescription className="text-slate-500">Choose your account type to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            <Link href="/auth/doctor" className="block">
              <Button
                variant="outline"
                className="w-full h-24 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/10 group-hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <Stethoscope className="h-6 w-6 text-blue-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-semibold text-slate-800">Healthcare Provider</div>
                    <div className="text-sm text-slate-500">Manage patients, appointments & records</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/auth/patient" className="block">
              <Button
                variant="outline"
                className="w-full h-24 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/10 group-hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <Heart className="h-6 w-6 text-blue-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-semibold text-slate-800">Patient</div>
                    <div className="text-sm text-slate-500">Track health, book appointments & more</div>
                  </div>
                </div>
              </Button>
            </Link>

            {/* Feature highlights */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Calendar className="h-5 w-5 text-blue-500 mx-auto" />
                  <span className="text-xs text-slate-500">Easy Scheduling</span>
                </div>
                <div className="space-y-2">
                  <FileText className="h-5 w-5 text-blue-500 mx-auto" />
                  <span className="text-xs text-slate-500">Digital Records</span>
                </div>
                <div className="space-y-2">
                  <Users className="h-5 w-5 text-blue-500 mx-auto" />
                  <span className="text-xs text-slate-500">Secure Platform</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
