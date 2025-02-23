import Image from "next/image";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* トップページ */}
      <section className={styles.top}>
        <img src="/tabedoki.svg" alt="タベドキのロゴ" />
        <p>いい感じのキャッチフレーズ</p>
      </section>
      <section>
      </section>
    </main>
  );
}
