"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase/config";
import { loginWithGoogle, logout } from "@/firebase/auth";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    // 認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ユーザーがログインしている場合、バックエンドの API を呼び出してユーザー一覧を取得する
  useEffect(() => {
    if (user) {
      const fetchUsers = async () => {
        try {
          const response = await fetch("http://localhost:8000/users/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("ユーザー一覧の取得に失敗しました");
          }
          const data = await response.json();
          setUsersList(data);
        } catch (error) {
          console.error("ユーザー一覧取得エラー:", error);
        }
      };
      fetchUsers();
    } else {
      // ログアウト時はユーザー一覧をクリア
      setUsersList([]);
    }
  }, [user]);

  const handleLogin = async () => {
    await loginWithGoogle();
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
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Users List</h2>
            {usersList.length > 0 ? (
              <ul>
                {usersList.map((u, index) => (
                  <li key={index}>
                    {u.displayName || u.name || "Unnamed User"} - {u.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users found.</p>
            )}
          </div>
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
