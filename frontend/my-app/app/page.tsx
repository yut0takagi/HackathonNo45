"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase/config";
import { loginWithGoogle, logout } from "@/firebase/auth";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const loggedInUser = await loginWithGoogle();
    if (loggedInUser) {
      router.push("/dashboard"); // 認証後にダッシュボードへ遷移
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Firebase Auth with Next.js</h1>
      {user ? (
        <>
          <p>Welcome, {user.displayName}!</p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded mt-4"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Login with Google
        </button>
      )}
    </div>
  );
}
