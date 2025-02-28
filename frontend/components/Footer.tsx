"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../app/(auth)/lib/FirebaseConfig"; // Firebaseのauthをインポート
import { onAuthStateChanged, signOut, User } from "firebase/auth";

import styles from "./Footer.module.scss";

const Footer = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // ログインユーザーの情報を取得
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth state changed:", currentUser); // 🔍 デバッグ用
            setUser(currentUser);
        });
    
        return () => unsubscribe();
    }, []);
    

    const doLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        try{
            await signOut(auth);
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("ログアウトエラー:", error);
        }
    };
    
      

    return (
        <>
            {/* フッターメニュー */}
            <footer className={styles.footer}>
                <nav>
                    <ul className={styles.navList}>
                        <li className={styles.navItem}>
                            <Link href="/fridge" className={styles.navButton}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 9.77746V16.2C5 17.8802 5 18.7203 5.32698 19.362C5.6146 19.9265 6.07354 20.3854 6.63803 20.673C7.27976 21 8.11984 21 9.8 21H14.2C15.8802 21 16.7202 21 17.362 20.673C17.9265 20.3854 18.3854 19.9265 18.673 19.362C19 18.7203 19 17.8802 19 16.2V5.00002M21 12L15.5668 5.96399C14.3311 4.59122 13.7133 3.90484 12.9856 3.65144C12.3466 3.42888 11.651 3.42893 11.0119 3.65159C10.2843 3.90509 9.66661 4.59157 8.43114 5.96452L3 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                <p>ホーム</p>
                            </Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link href="/recipe" className={styles.navButton}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 21V3M15 21V3C17.2091 3 19 4.79086 19 7V9C19 11.2091 17.2091 13 15 13M11 3V8C11 9.65685 9.65685 11 8 11C6.34315 11 5 9.65685 5 8V3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                <p>レシピ</p>
                            </Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link href="/setting" className={styles.navButton}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                <p>設定</p>
                            </Link>
                        </li>
                        {/* 🔹 ここにログイン情報を追加 */}
                        {user && (
                            <li className={styles.navItem} style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                                <div className={styles.userInfo}>
                                    <p>{user.displayName || user.email}</p>
                                    <Link href="/login" className={styles.logoutButton} onClick={doLogout}>
                                        ログアウト
                                    </Link>
                                </div>
                            </li>
                        )}
                    </ul>
                </nav>
            </footer>
        </>
    );
};

export default Footer;
