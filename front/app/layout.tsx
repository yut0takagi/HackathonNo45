import type { Metadata } from "next";
import { Zen_Maru_Gothic, Noto_Emoji, Noto_Sans_JP } from "next/font/google";
import "@/styles/globals.scss";

const Emoji = Noto_Emoji({
  weight: ["400"],
})

const Main_Font = Zen_Maru_Gothic({
  weight: ["400"],
  variable: '--main-font'
});

const Sub_Font = Noto_Sans_JP({
  weight: "variable",
  variable: '--sub-font'
})

export const metadata: Metadata = {
  title: "タベドキ",
  description: "冷蔵庫を賢く管理🥕",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${Sub_Font.className}`}>
        {children}
      </body>
    </html>
  );
}
