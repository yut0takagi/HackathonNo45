"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

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
  const [recognizedData, setRecognizedData] = useState<any>(null);

  // 画像をキャプチャ
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImageBase64(imageSrc.split(",")[1]); // Base64 部分のみを抽出
    }
  }, [webcamRef]);

  // 画像を API に送信
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
    <>
      <h1>カメラアプリ</h1>

      {isCaptureEnable || (
        <button onClick={() => setCaptureEnable(true)}>開始</button>
      )}

      {isCaptureEnable && (
        <>
          <button onClick={() => setCaptureEnable(false)}>終了</button>
          <Webcam
            audio={false}
            width={540}
            height={360}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
          <button onClick={capture}>キャプチャ</button>
        </>
      )}

      {imageBase64 && (
        <>
          <h3>キャプチャ画像</h3>
          <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Captured" />
          <button onClick={handleUpload} disabled={loading}>
            {loading ? "アップロード中..." : "画像をアップロード"}
          </button>
        </>
      )}

      {recognizedData && (
        <div>
          <h3>認識結果</h3>
          <pre>{JSON.stringify(recognizedData, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
