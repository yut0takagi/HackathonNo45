import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "../styles/globals.scss";

const Main_Font = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
});

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
      <body className={`${Main_Font.className}`}>
        {children}
      </body>
    </html>
  );
}
