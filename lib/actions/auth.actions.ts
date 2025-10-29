'use server';

import { db } from "@/firebase/admin";
import { cookies } from 'next/headers';
import { getAuth } from "firebase-admin/auth"; // CORRECT IMPORT for Auth Service
// NOTE: Assuming your initial Firebase Admin App setup is correct in @/firebase/admin

const ONE_WEEK = 60 * 60 * 24 * 7;

// NOTE: Assuming SignUpParams, SignInParams, and User types are defined elsewhere

export async function signUp (params: SignUpParams) {
    const { uid, name, email } = params;

    try{
        const userRecord = await db.collection('users').doc(uid).get();
        if(userRecord.exists){
            return {
                success: false,
                message: 'user already exists. Please sign in instead.',
            }
        }
        await db.collection('users').doc(uid).set({
            name,email
        })
        return{
            success: true,
            message: 'Account created successfully.Please sign in',
        }

    }catch(e: any){
        console.error('Error creating a user ',e)
        // Note: The 'auth/email-already-exists' error is usually thrown by Admin's createUser,
        // which isn't used here, but keeping the block for robustness.
        if (e.code === 'auth/email-already-exists'){
            return{
                success: false,
                message:'This email is already in use',
            }
        }
        return {
            success: false,
            message:'Failed to create an account',
        }
    }
}

export async function signIn (params: SignInParams) {
    const {email, idToken } = params;
    const adminAuth = getAuth(); // Get the Admin Auth instance

    try{
        // CORRECT: Call getUserByEmail on the Admin Auth instance
        const userRecord = await adminAuth.getUserByEmail(email);

        if(!userRecord){
            return {
                success: false,
                message : 'User does not exists. Create an account instead. '
            }
        }

        // Pass the idToken to set the session cookie
        await setSessionCookies(idToken);

        return {
            success: true,
            message: 'Successfully logged in.'
        }

    } catch(e) {
        console.log(e);
        return {
            success: false,
            message: 'Failed to log into an account',
        }
    }
}

export async function setSessionCookies(idToken: string) {
    const cookieStore = await cookies();
    const adminAuth = getAuth(); // Get the Admin Auth instance

    // CORRECT: Call createSessionCookie on the Admin Auth instance
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000,
    });

    cookieStore.set("session", sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path:'/',
        sameSite: 'lax'
    })

}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const adminAuth = getAuth(); // Get the Admin Auth instance

    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) return null;

    try {
        // CORRECT: Call verifySessionCookie on the Admin Auth instance
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

        // get user info from db
        const userRecord = await db
            .collection("users")
            .doc(decodedClaims.uid)
            .get();
        if (!userRecord.exists) return null;

        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User;
    } catch (error) {
        console.log(error);

        // Invalid or expired session
        return null;
    }
}

// Check if user is authenticated
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}