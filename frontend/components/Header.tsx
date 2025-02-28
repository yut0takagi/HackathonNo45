"use client";

import { useRouter } from "next/router";
import styles from "./Header.module.scss";

interface HeaderProps {
  title: string; // ページごとのタイトルを受け取る
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className={styles.header}>
      <img src="/tabedoki.svg" alt="タベドキのロゴ" />
    </header>
  );
}
