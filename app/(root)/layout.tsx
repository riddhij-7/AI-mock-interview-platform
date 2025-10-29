// /app/(root)/layout.tsx (Protected Layout)
import {ReactNode} from 'react'
import Link from "next/link";
import Image from "next/image";
import {isAuthenticated} from "@/lib/actions/auth.actions";
import {redirect} from "next/navigation";

// 1. FIX: Make the component 'async'
const RootLayout = async ({children}:{children: ReactNode}) => {
    const isUserAunthenticated = await isAuthenticated()

    // 2. LOGIC: If NOT authenticated, redirect to sign-in
    if(!isUserAunthenticated) {
        redirect('/sign-in')
    }

    return(
        <div className='root-layout'>
            <nav>
                <Link href='/' className="flex items-center gap-2">
                    <Image src='/logo.svg'
                           alt='Logo'
                           width={38}
                           height={32}
                    />
                    <h2 className="text-primary-100">PrepWise</h2>
                </Link>
            </nav>
            {children}
        </div>
    )
}
export default RootLayout