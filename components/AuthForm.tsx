"use client"

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link";
import {toast} from "sonner";
import FormField from "@/components/FormField";
import {useRouter} from "next/navigation";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {Auth} from "firebase/auth";
import {signIn, signUp} from "@/lib/actions/auth.actions";
import {auth} from "@/firebase/client";

// NOTE: Ensure FormType is defined elsewhere, e.g., type FormType = 'sign-up' | 'sign-in';

const AuthFormSchema = (type : FormType) => {
    return z.object({
        // FIX 1: Use strict equality (===) for conditional requirement.
        name: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3),
    })
}

const AuthForm = ({type}:{ type: FormType}) => {
    const router = useRouter();
    const formSchema = AuthFormSchema(type);

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            if (type === "sign-up"){
                const {name, email, password} = values;

                // FIX 2: Use createUserWithEmailAndPassword for SIGN-UP
                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email,
                    password,
                })

                if(!result?.success){
                    toast.error(result?.message);
                    return;
                }

                toast.success("Account successfully created! Please Sign In");
                router.push("/sign-in");

            }else {
                // type is "sign-in"
                const {email, password} = values;

                // FIX 3: Use signInWithEmailAndPassword for SIGN-IN
                const userCredentials = await signInWithEmailAndPassword(auth, email, password);

                const idToken = await userCredentials.user.getIdToken();
                if(!idToken){
                    toast.error('Sign In failed: No ID Token received!');
                    return;
                }

                // FIX 4: Check the result of the server action
                const result = await signIn({
                    email,
                    idToken
                })

                if(!result?.success){
                    toast.error(result?.message || 'Server Sign-In Failed');
                    return;
                }

                toast.success("Sign In Successfully");
                router.push('/');
            }
        }catch (error: any) // Catch all errors, including Firebase errors
        {
            console.error(error);

            let errorMessage = "An unknown error occurred.";

            // Handle specific Firebase Auth errors
            if (error.code && error.code.startsWith('auth/')) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = "This email is already in use. Please sign in.";
                        break;
                    case 'auth/invalid-credential':
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessage = "Invalid email or password.";
                        break;
                    default:
                        errorMessage = error.message;
                }
            }

            toast.error(errorMessage);
        }
    }

    const isSignIn = type === "sign-in";
    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image
                        src="/logo.svg"
                        alt='logo'
                        height={32}
                        width={38}
                    />
                    <h2 className="text-primary-100"> PrepWise</h2>

                </div>
                <h3>Practice Job interviews with AI</h3>


                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                label="Name"
                                placeholder="Your Name "/>
                        )}
                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your Email address "/>
                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter your Password "
                            type="password"/>

                        <Button className="btn" type="submit">{isSignIn ? 'Sign-In': 'Create an Account'}</Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignIn ? 'No account yet? ': 'Have an account already?'}
                    <Link href={!isSignIn ? '/sign-in':'/sign-up'} className= "class-bold text-user-primary ml-1">
                        {!isSignIn ? "Sign-in" : "Sign-up"}
                    </Link>
                </p>
            </div>
        </div>
    )
}
export default AuthForm