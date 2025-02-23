import styles from "./footer.module.scss";
const Footer = () => {
    return (
        <>
            {/* フッターメニュー */}
            <footer className={styles.footer}>
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