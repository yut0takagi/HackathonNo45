"use client";

import Link from "next/link";
import styles from "./page.module.scss";
import form from "@/components/Form.module.scss";
import Fridge from "@/components/Fridge";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
// import { auth } from "../lib/firebaseConfig"; // ✅ 修正: 正しいパスに変更
import { auth } from '../lib/FirebaseConfig';

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter(); // ✅ useRouter を使用

  const doRegister = async (): Promise<void> => {
    if (!email || !password) {
      alert("メールアドレスとパスワードを入力してください");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("登録完了！");
      console.log(userCredential.user);

      router.push("/login");

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("登録エラー:", error.message);
        alert("エラー: " + error.message);
      }
    }
  };

  return (
    <main className={styles.main}>
      <section className={form.form}>
        <Fridge>
          <h2>新規登録</h2>
          <form action="/api/register" method="POST">
            <input
              type="email"
              name="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={doRegister}>登録する</button>
          </form>
          <p>アカウントをお持ちの方は<Link href="/login">こちら</Link></p>
        </Fridge>
      </section>
    </main>
  );
}
