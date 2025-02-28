"use client";

import { useEffect, useState } from "react";
import { auth } from "../../(auth)/lib/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import styles from "./page.module.scss";

interface MenuItem {
  name: string;
  ingredients: string[];
  instructions: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 ユーザーの UID を取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchMenu(currentUser.uid); // UID を使ってメニュー取得
      } else {
        setMenus([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 `/menu/{uid}` エンドポイントを叩く
  const fetchMenu = async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/menu/${uid}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`エラー: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setMenus(data.menus); // `menus` 配列をセット
    } catch (error: any) {
      console.error("メニュー取得エラー:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <h1>🍽️ あなたの食材で作れるメニュー</h1>

      {loading && <p>⏳ メニューを取得中...</p>}
      {error && <p className={styles.error}>⚠️ {error}</p>}

      {!loading && menus.length === 0 && <p>📌 食材がありません</p>}

      <ul className={styles.menuList}>
        {menus.map((menu, index) => (
          <li key={index} className={styles.menuItem}>
            <h2>{menu.name}</h2>
            <p>
              <strong>材料:</strong>
              <span className={styles.ingredients}> {menu.ingredients.join(", ")}</span>
            </p>
            <p><strong>作り方:</strong> {menu.instructions}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
