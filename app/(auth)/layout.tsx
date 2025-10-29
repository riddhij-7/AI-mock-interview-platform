// /app/(auth)/layout.tsx (Public Layout for sign-in/sign-up)
import {ReactNode} from 'react'
import {isAuthenticated} from "@/lib/actions/auth.actions";
import {redirect} from "next/navigation";

const AuthLayout  = async ({children}: {children: ReactNode}) => {
    const isUserAunthenticated = await isAuthenticated()

    // 3. LOGIC: If IS authenticated, redirect to the home page (where protected content is)
    if(isUserAunthenticated) { // Check for IS authenticated (no '!')
        redirect('/');
    }

    return(
        <div className="auth-layout">{children}</div>
    )
}
export default AuthLayout