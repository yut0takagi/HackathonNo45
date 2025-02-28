// /loginにリダイレクトさせる

"use client";

export default function Home() {

    window.location.href = "/login";

    return (
        <main>
            <img src="/tabedoki.svg" alt="タベドキのロゴ" />
            <p>あなたの冷蔵庫を賢く管理🥕</p>
        </main>
    );
}

