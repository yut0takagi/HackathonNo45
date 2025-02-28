"use client"
import { useState, useRef, useEffect } from "react";
import Fridge from "@/components/Fridge";
import styles from "./page.module.scss";
import { auth } from "../../(auth)/lib/FirebaseConfig";

import { getAuth, onAuthStateChanged, User } from "firebase/auth";
// サンプルの食材データ
// 

interface Ingredient {
  id: string;
  name: string;
  genre: string;
  icon: string;
  quantity: number;
  nearestExpiration: string;
}

// APIからデータを取得

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchData(currentUser.uid); // 🔥 ログインユーザーのUIDを使ってデータ取得
      } else {
        setUser(null);
        setIngredients([]); // 未ログインならデータをリセット
      }
    });

    return () => unsubscribe();
  }, []);


  const fetchData = async (uid: string) => {
    try {
      const response = await fetch(`http://localhost:8000/fridge_data/${uid}`);
      if (!response.ok) throw new Error("データの取得に失敗しました");

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const transformedIngredients: Ingredient[] = data.data.map((item) => ({
          id: item.id,
          name: item.name,
          genre: item.genre,
          icon: item.icon || "❓", // デフォルトアイコン
          quantity: item.quantity,
          nearestExpiration: item.nearestExpiration,
        }));

        setIngredients(transformedIngredients);
      }
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
  };

  // フィルター用の文字列
  const [filter, setFilter] = useState("");
  // 詳細表示中の食材IDリスト
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  // ソート順（true: 昇順、false: 降順）
  const [sortAscending, setSortAscending] = useState(true);
  // 表示形式（リスト形式かアイテム形式か）
  const [displayMode, setDisplayMode] = useState(true);

  // フィルターおよびソート処理
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.includes(filter)
  );

  const sortedIngredients = filteredIngredients.sort((a, b) => {
    if (a.name < b.name) return sortAscending ? -1 : 1;
    if (a.name > b.name) return sortAscending ? 1 : -1;
    return 0;
  });

  const toggleDetails = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 昇順・降順の切り替え
  const toggleSort = () => {
    setSortAscending((prev) => !prev);
  };

  // ポップアップの開閉
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 枠外クリックで閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current !== event.target // ← ボタンのクリックは無視！
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);


  return (
    <>
      <main className={styles.main}>
        {/* 冷蔵庫のイラスト */}
        <Fridge height={300} width={210}>
          <p>私の冷蔵庫</p>
        </Fridge>
        {/* リストのトップ（フィルター＆ソートアイコン表示） */}
        <div className={styles.listHeader}>
          <input
            type="text"
            placeholder="フィルタを入力"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterInput}
          />
          {/* ソートアイコン（クリックで昇順・降順を切替） */}
          <button onClick={toggleSort} className={styles.sortButton}>
            {sortAscending ? "▲" : "▼"}
          </button>
          {/* リストの表示形式（クリックで切替） */}
          <button
            onClick={() => setDisplayMode(!displayMode)}
            className={styles.displayButton}
          >
            {displayMode ? "アイテム" : "リスト"}
          </button>
        </div>

        {/* リスト一覧 */}
        <ul className={styles.ingredientList}>
          {sortedIngredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className={`
                ${styles.ingredientItem}
                ${(displayMode || expandedIds.includes(ingredient.id)) ? styles.expanded : ""}
                `}
              onClick={() => toggleDetails(ingredient.id)}
            >
              <div className={styles.ingredientSummary}>
                <span className={styles.icon}>
                  {ingredient.icon}
                  <span className={styles.quantity}>{ingredient.quantity}</span>
                </span>
                {/* リストの場合のみ表示 */}
                {(displayMode || expandedIds.includes(ingredient.id)) && (
                  <div className={styles.details}>
                    <h2 className={styles.name}>{ingredient.name}<span>#{ingredient.genre}</span></h2>
                    <span className={styles.expiration}>
                      一番近い期限: {ingredient.nearestExpiration}
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.bottomLine}>
          {/* 右下のボタン（＋ → ー 切り替え） */}
          <button
            ref={buttonRef} // ボタンを独立させる
            className={`${styles.addButton} ${menuOpen ? styles.open : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "－" : "＋"}
          </button>

          {/* ポップアップメニュー */}
          <div ref={menuRef} className={`${styles.menuWrapper} ${menuOpen ? styles.show : ""}`}>
            <div className={styles.menu}>
              <button onClick={() => alert("食材を登録")} className={styles.menuItem}>
                🍽️ 食材を登録
              </button>
              <button onClick={() => alert("使った食材を記録")} className={styles.menuItem}>
                ✍️ 使った食材を記録
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
