"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/"); // 未ログインならトップへリダイレクト
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && <p>Welcome, {user.displayName}!</p>}
    </div>
  );
}
