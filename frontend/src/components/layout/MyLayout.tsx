'use client'

import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import NextTopLoader from 'nextjs-toploader';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '../ui/sonner';
import { useTheme } from 'next-themes';

export default function MyLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const { theme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className='flex justify-center items-center bg-black text-white h-screen w-full'>
                <Loader2 className='animate-spin' />
            </div>
        )
    }

    return (
        <>

            <Toaster
                position="top-right"
                richColors
                theme={theme as "light" | "dark" | "system"}
            />
            <SessionProvider>
                <NextTopLoader
                    height={4}
                    showSpinner={true}
                    color='#5a3bf6'
                />
                {children}
            </SessionProvider>
        </>
    )
}
