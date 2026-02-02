"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import Link from "next/link";

export default function LoginPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                router.push("/drop");
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-white">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
                        <p className="text-gray-500">Sign in to your OneDrop account</p>
                    </div>

                    <div className="space-y-4">
                        <GoogleAuthButton text="Sign in with Google" />
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link href="/register" className="font-medium text-black hover:underline transition-all">
                            Create one
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">OneDrop</h1>
                </div>
            </div>
        </div>
    );
}
