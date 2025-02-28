"use client";

import { useState, useEffect } from "react";
import { auth } from "../../(auth)/lib/FirebaseConfig";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import styles from "./page.module.scss";

export default function UploadImage() {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognizedData, setRecognizedData] = useState<{ items: any[] } | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // ログインユーザーのUIDを取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 画像選択時の処理
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  // 画像をBase64に変換する関数
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // `data:image/jpeg;base64,` を削除
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // 画像をアップロードしてバックエンドに送信し、結果を取得
  const handleUpload = async () => {
    if (!image) {
      alert("画像を選択してください");
      return;
    }
  
    setLoading(true);
  
    try {
      const base64Image = await convertImageToBase64(image);
  
      const response = await fetch("http://localhost:8000/images/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_base64: base64Image }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();  // 🔍 エラー詳細を取得
        console.error("サーバーエラー:", errorText);
        throw new Error(`サーバーエラー: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      console.log("APIレスポンス:", data);
  
      const parsedData = data.data;
      if (!parsedData.recognized || !Array.isArray(parsedData.ingredients)) {
        throw new Error("画像認識データが正しくありません");
      }
  
      const formattedData = { items: parsedData.ingredients };
      setRecognizedData(formattedData);

      // 🔥 `/savedata/{uid}` にデータを送信
      if (user) {
        await saveDataToDB(user.uid, formattedData);
      }
  
    } catch (error: any) {
      console.error("画像認識エラー:", error);
      alert(`画像認識に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 取得したデータをDBに保存
  const saveDataToDB = async (uid: string, data: { items: any[] }) => {
    try {
      const response = await fetch(`http://localhost:8000/savedata/${uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();  // 🔍 エラー詳細を取得
        console.error("データ保存エラー:", errorText);
        throw new Error(`データ保存エラー: ${response.status} - ${errorText}`);
      }

      alert("データを保存しました");
    } catch (error) {
      console.error("データ保存エラー:", error);
      alert("データ保存に失敗しました");
    }
  };

  return (
    <div>
      <h2>画像アップロード</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={loading || !user}>
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
