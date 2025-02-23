"use client"
import { useState } from "react";
import Footer from '@/components/Footer'
import Fridge from "@/components/Fridge";
import styles from "./page.module.scss";

// サンプルの食材データ
const ingredients = [
  {
    id: "1",
    name: "ブロッコリー",
    icon: "🥦",
    quantity: 3,
    nearestExpiration: "2025/03/20",
    details: [
      { id: "1-1", expiration: "2025/03/20", quantity: 1 },
      { id: "1-2", expiration: "2025/03/30", quantity: 2 },
    ],
  },
  {
    id: "2",
    name: "トマト",
    icon: "🍅",
    quantity: 5,
    nearestExpiration: "2025/03/15",
    details: [
      { id: "2-1", expiration: "2025/03/15", quantity: 3 },
      { id: "2-2", expiration: "2025/03/25", quantity: 2 },
    ],
  },
  {
    id: "3",
    name: "ニンジン",
    icon: "🥕",
    quantity: 2,
    nearestExpiration: "2025/03/10",
    details: [
      { id: "3-1", expiration: "2025/03/10", quantity: 2 },
    ],
  },
];

export default function Home() {
  // フィルター用の文字列
  const [filter, setFilter] = useState("");
  // 詳細表示中の食材IDリスト
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  // ソート順（true: 昇順、false: 降順）
  const [sortAscending, setSortAscending] = useState(true);

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
        </div>

        {/* リスト一覧 */}
        <ul className={styles.ingredientList}>
          {sortedIngredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className={styles.ingredientItem}
              onClick={() => toggleDetails(ingredient.id)}
            >
              <div className={styles.ingredientSummary}>
                <span className={styles.icon}>
                  {ingredient.icon}
                  <span className={styles.quantity}>{ingredient.quantity}</span>
                </span>
                <div className={styles.details}>
                  <h2 className={styles.name}>{ingredient.name}</h2>
                  <span className={styles.expiration}>
                    一番近い期限: {ingredient.nearestExpiration}
                  </span>
                </div>
              </div>
              {/* 詳細表示（タッチ時に展開） */}
              {expandedIds.includes(ingredient.id) && (
                <div className={styles.ingredientDetails}>
                  {ingredient.details.map((detail) => (
                    <div key={detail.id} className={styles.detailItem}>
                      <span>期限: {detail.expiration} </span>
                      <span>個数: {detail.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
      <Footer></Footer>
    </>
  );
}
