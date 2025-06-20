'use client'

import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import NextTopLoader from 'nextjs-toploader';
import { SessionProvider } from 'next-auth/react';

export default function MyLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

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
