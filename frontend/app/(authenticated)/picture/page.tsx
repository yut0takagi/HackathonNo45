"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { auth } from "../../(auth)/lib/FirebaseConfig";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import styles from "./page.module.scss";

const videoConstraints = {
  width: 720,
  height: 360,
  facingMode: "user",
};

export default function CaptureAndUpload() {
  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recognizedData, setRecognizedData] = useState<{ items: any[] } | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // 🔥 ログインユーザーのUIDを取得
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

  // 🔥 画像をキャプチャ（キャプチャ後にカメラを非表示）
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImageBase64(imageSrc.split(",")[1]); // `data:image/jpeg;base64,` を削除
      setCaptureEnable(false); // カメラを非表示にする
    }
  }, [webcamRef]);

  // 🔥 画像をアップロードしてバックエンドに送信
  const handleUpload = async () => {
    if (!imageBase64) {
      alert("キャプチャした画像がありません");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/images/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_base64: imageBase64 }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("サーバーエラー:", errorText);
        throw new Error(`サーバーエラー: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("APIレスポンス:", data);

      // 🔥 `data.data` が JSON 文字列ならパースする
      const parsedData = typeof data.data === "string" ? JSON.parse(data.data) : data.data;

      if (!parsedData.recognized || !Array.isArray(parsedData.ingredients)) {
        throw new Error("画像認識データが正しくありません");
      }

      // `ingredients` を `items` にマッピング
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

  // 🔥 取得したデータを `/savedata/{uid}` に保存
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
        const errorText = await response.text();
        console.error("データ保存エラー:", errorText);
        throw new Error(`データ保存エラー: ${response.status} - ${errorText}`);
      }

      alert("データを保存しました");
    } catch (error) {
      console.error("データ保存エラー:", error);
      alert("データ保存に失敗しました");
    }
  };

  const handleRetake = () => {
    setImageBase64(null);
    setRecognizedData(null);
    setCaptureEnable(true);
  };

  return (
    <div className={styles.container}>
      <h1>カメラ</h1>

      {/* 🔥 キャプチャが完了するまではカメラを表示 */}
      {!imageBase64 && (
        <div className={styles.captureSection}>
          {isCaptureEnable || (
            <button onClick={() => setCaptureEnable(true)} className={styles.captureButton}>
              開始
            </button>
          )}

          {isCaptureEnable && (
            <>
              <button onClick={() => setCaptureEnable(false)} className={styles.captureButton}>
                終了
              </button>
              <Webcam
                audio={false}
                width={540}
                height={360}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
              <button onClick={capture} className={styles.captureButton}>
                キャプチャ
              </button>
            </>
          )}
        </div>
      )}

      {/* 🔥 キャプチャ画像のみ表示（カメラ非表示） */}
      {imageBase64 && (
        <div className={styles.captureSection}>
          <h3>キャプチャ画像</h3>
          <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Captured" className={styles.capturedImage} />
          <button onClick={handleUpload} disabled={loading} className={styles.captureButton}>
            {loading ? "アップロード中..." : "画像をアップロード"}
          </button>
          <button className={styles.captureSection} onClick={handleRetake}>
            🔄 再撮影
          </button>
        </div>
      )}

        {recognizedData?.items?.length ? (
        <div className={styles.resultSection}>
            <h3 className={styles.resultTitle}>認識された食材</h3>
            <ul className={styles.ingredientList}>
            {recognizedData.items.map((item) => (
                <li key={item.id} className={styles.ingredientItem}>
                <span className={styles.ingredientName}>{item.name}</span>：
                <span className={styles.ingredientQuantity}>{item.quantity}個</span>
                </li>
            ))}
            </ul>
        </div>
        ) : null}


    </div>
  );
}
