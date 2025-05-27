'use client'

import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import NextTopLoader from 'nextjs-toploader';

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
            <NextTopLoader
                color="var(--primary)" 
                height={3}
                showSpinner={false}
            />
            {children}
        </>
    )
}
