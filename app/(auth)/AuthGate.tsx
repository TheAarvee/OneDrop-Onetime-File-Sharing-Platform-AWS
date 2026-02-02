"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                setLoading(false);
                router.push("/login");
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

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
