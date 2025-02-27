"use client";

import Link from 'next/link'

import Fridge from "@/components/Fridge";

import styles from "./page.module.scss";
import form from "@/components/Form.module.scss"

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// 現時点で使わないものもあるが今後のことを考えて入れておく

import { useState } from "react";

import { auth } from '../lib/FirebaseConfig';

import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // ✅ useRouter を使用

  const doLogin = async (): Promise<void> => {
    if (!email || !password) {
      alert("メールアドレスとパスワードを入力してください");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("ログイン成功:", userCredential.user);
      alert("ログインOK!");

      // ✅ ログイン成功後に /fridge へ遷移
      router.push("/fridge");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("ログインエラー:", error.message);
        alert("エラー: " + error.message);
      }
    }
  };

  return (
    <main className={styles.main}>
      <section className={form.form}>
        <Fridge>
          <h2>ログイン</h2>
          {/* <form action="/api/login" method="POST"> */}
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" name="email" placeholder="メールアドレス" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" name="password" placeholder="パスワード" onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={()=>{
                  doLogin();
                }}>ログイン</button>
          </form>
          <p>新規登録は<Link href="/register">こちら</Link></p>
        </Fridge>
      </section>
    </main>
  );
}
