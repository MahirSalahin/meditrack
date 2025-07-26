import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, FileText, Users, Stethoscope, Heart, LogIn } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      {/* Simplified background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-white/5 to-transparent"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">MediTrack</h1>
          <p className="text-slate-600">Your Digital Health Companion</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-800">Get Started</CardTitle>
            <CardDescription className="text-slate-500">Choose your account type</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pb-6">
            {/* Compact Sign In Button */}
            <Link href="/auth/login">
              <Button size='sm' className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Existing Account
              </Button>
            </Link>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-500">Or register as</span>
              </div>
            </div>

            {/* Compact Registration Options */}
            <div className="space-y-3">
              <Link href="/auth/doctor" className="block">
                <Button
                  variant="outline"
                  className="w-full h-14 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group bg-transparent"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/10 group-hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors duration-200">
                      <Stethoscope className="h-4 w-4 text-blue-500 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-800">Healthcare Provider</div>
                      <div className="text-xs text-slate-500">Manage patients & appointments</div>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/auth/patient" className="block">
                <Button
                  variant="outline"
                  className="w-full h-14 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group bg-transparent"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/10 group-hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors duration-200">
                      <Heart className="h-4 w-4 text-blue-500 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-800">Patient</div>
                      <div className="text-xs text-slate-500">Track health & book appointments</div>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>

            {/* Compact Feature highlights */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex justify-center space-x-8 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-slate-500">Easy Scheduling</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-slate-500">Digital Records</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Users className="h-4 w-4 text-blue-500" />
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
