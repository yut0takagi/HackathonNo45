import styles from "./footer";

const Footer = () => {
    return (
        <>
            {/* フッターメニュー */}
            <footer className={styles.footerMenu}>
                <nav>
                    <ul className={styles.navList}>
                        <li className={styles.navItem}>
                            <button className={styles.navButton}>ホーム</button>
                        </li>
                        <li className={styles.navItem}>
                            <button className={styles.navButton}>検索</button>
                        </li>
                        <li className={styles.navItem}>
                            <button className={styles.navButton}>登録</button>
                        </li>
                        <li className={styles.navItem}>
                            <button className={styles.navButton}>設定</button>
                        </li>
                    </ul>
                </nav>
            </footer>
        </>
    );
}

export default Footer