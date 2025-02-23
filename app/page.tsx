import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* トップページ */}
      <section className={styles.top}>
        <img src="/tabedoki.svg" alt="タベドキのロゴ" />
        <p>あなたの冷蔵庫を賢く管理🥕</p>
      </section>
      {/* ログインフォーム */}
      <section className={styles.form}>
        <h2>ログイン</h2>
        <form action="/api/login" method="POST">
          <input type="email" name="email" placeholder="メールアドレス" />
          <input type="password" name="password" placeholder="パスワード" />
          <button type="submit">ログイン</button>
        </form>
        <p>新規登録は<a href="/register">こちら</a></p>
      </section>
    </main>
  );
}
