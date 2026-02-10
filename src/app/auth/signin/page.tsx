"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("registered")) {
            setMessage("Registration successful! Admins will review your account soon. If you registered as an admin, you can log in immediately.");
        }
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            console.log("Attempting sign in...");
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            console.log("Sign in response:", res);

            if (res?.error) {
                // Map common NextAuth error codes to user-friendly messages
                let errorMessage = res.error;
                if (res.error === "CredentialsSignin") {
                    errorMessage = "Invalid email or password";
                } else if (res.error === "Your account is pending approval.") {
                    errorMessage = "Your account is pending approval by an admin.";
                } else if (res.error === "Your account has been rejected.") {
                    errorMessage = "Your account has been rejected. Please contact support.";
                }

                setError(errorMessage);
                setLoading(false);
            } else if (res?.ok) {
                console.log("Sign in successful, redirecting...");
                router.push("/dashboard");
                // We keep loading true while redirecting to avoid flickering 
                // but if it stays too long, maybe we should stop it.
            } else {
                setError("Sign in failed. Please try again.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Sign in error:", err);
            setError("An unexpected error occurred");
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back
                    </h2>
                </div>

                {message && <div className="text-green-700 text-sm text-center font-medium bg-green-50 p-4 rounded-lg border border-green-100">{message}</div>}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</div>}

                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
        </Suspense>
    );
}
