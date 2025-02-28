"use client";

import { useState } from "react";

export default function UploadImage() {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognizedData, setRecognizedData] = useState<any>(null);

  // 画像選択時の処理
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  // 画像をアップロードしてバックエンドに送信
  const handleUpload = async () => {
    if (!image) {
      alert("画像を選択してください");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", image);

      // APIリクエストを送信
      const response = await fetch("http://localhost:8000/images/", {
        method: "POST",
        body: formData, // 画像データをそのまま送信
      });

      const data = await response.json();
      setRecognizedData(data);
    } catch (error) {
      console.error("画像認識エラー:", error);
      alert("画像認識に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>画像アップロード</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "アップロード中..." : "画像をアップロード"}
      </button>

      {recognizedData && (
        <div>
          <h3>認識結果</h3>
          <pre>{JSON.stringify(recognizedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}