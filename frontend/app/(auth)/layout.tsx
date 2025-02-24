import Footer from '@/components/Footer'
import styles from "./layout.module.scss";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* トップページ */}
      <section className={styles.top}>
        <img src="/tabedoki.svg" alt="タベドキのロゴ" />
        <p>あなたの冷蔵庫を賢く管理🥕</p>
      </section>
      {children}
      <Footer />
    </>
  );
}
