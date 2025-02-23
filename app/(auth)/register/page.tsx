import Link from 'next/link'

import styles from "./page.module.scss";
import form from "@/components/Form.module.scss"
import Fridge from '@/components/Fridge';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* トップページ */}
      <section className={styles.top}>
        <img src="/tabedoki.svg" alt="タベドキのロゴ" />
        <p>あなたの冷蔵庫を賢く管理🥕</p>
      </section>
      {/* ログインフォーム */}
      <section className={form.form}>
        <Fridge>
          <h2>新規登録</h2>
          <form action="/api/register" method="POST">
            <input type="email" name="email" placeholder="メールアドレス" />
            <input type="password" name="password" placeholder="パスワード" />
            <input type="text" name="name" placeholder="名前" />
            <button type="submit">登録する</button>
          </form>
          <p>アカウントをお持ちの方は<Link href="/">こちら</Link></p>
        </Fridge>
      </section>
    </main>
  );
}
