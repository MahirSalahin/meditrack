"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Mail, Lock, Eye, EyeOff, Activity } from "lucide-react"
import { useLogin } from "@/lib/api/auth.service"
import { useRouter } from "next/navigation"

// Validation schema
const schema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof schema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [redirecting, setRedirecting] = useState(false)
    const { mutateAsync: login, isPending: isLoginPending, isError: isLoginError, error: loginError } = useLogin()
    const router = useRouter()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        const response = await login(data)
        if (!response.error) {
            setRedirecting(true)
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-slate-100/50"></div>
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-500/3 rounded-full blur-lg"></div>

            <div className="relative z-10 w-full max-w-md">
                {redirecting ? (
                    <RedirectingUI />
                ) : (
                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader className="text-center space-y-4 relative">
                            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                                <Activity className="h-8 w-8 text-white" />
                            </div>

                            <div>
                                <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
                                <CardDescription className="text-slate-500 mt-2">
                                    Sign in to your MediTrack account
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Error Alert */}
                            {isLoginError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {loginError.message}
                                </div>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                            placeholder="Enter your email"
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
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-medium">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter your password"
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

                                    <div className="flex items-center justify-between">
                                        <FormField
                                            control={form.control}
                                            name="rememberMe"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-sm text-slate-600 font-normal">
                                                        Remember me
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-medium"
                                        disabled={isLoginPending}
                                    >
                                        {isLoginPending ? "Signing in..." : "Sign In"}
                                    </Button>
                                </form>
                            </Form>

                            {/* Registration links */}
                            <div className="text-center space-y-4 pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-600">
                                    Don&apos;t have an account? Choose your account type:
                                </p>
                                <div className="flex flex-col space-y-2">
                                    <Link href="/auth/doctor">
                                        <Button
                                            variant="outline"
                                            className="w-full border-slate-200 hover:border-blue-500 hover:bg-blue-50/50"
                                        >
                                            Register as Healthcare Provider
                                        </Button>
                                    </Link>
                                    <Link href="/auth/patient">
                                        <Button
                                            variant="outline"
                                            className="w-full border-slate-200 hover:border-blue-500 hover:bg-blue-50/50"
                                        >
                                            Register as Patient
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}


function RedirectingUI() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Redirecting...</CardTitle>
                <CardDescription>
                    You are being redirected to the dashboard.
                </CardDescription>
            </CardHeader>
        </Card>
    )
}