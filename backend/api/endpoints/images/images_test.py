from fastapi import FastAPI, UploadFile, File, HTTPException, APIRouter
from pydantic import BaseModel
import base64
import io
from PIL import Image
import numpy as np
from ultralytics import YOLO
import cv2
import uuid
import datetime

router = APIRouter()

# YOLOモデルのロード
model = YOLO("yolov8n.pt")

# 画像データのリクエストモデル
class ImageRequest(BaseModel):
    image_data: str  # base64 エンコード画像
    timestamp: str

# レスポンスモデル
class RecognizedItem(BaseModel):
    name: str
    quantity: str
    unit: str
    expiration_date: str

class ImageResponse(BaseModel):
    image_id: int
    recognized: bool
    items: list[RecognizedItem]


@router.post("/api/images", response_model=ImageResponse)
async def upload_image(request: ImageRequest):
    try:
        # base64デコードして画像を開く
        image_data = base64.b64decode(request.image_data)
        image = Image.open(io.BytesIO(image_data))

        # 画像認識処理
        recognized_items = image_api_test(image)

        return ImageResponse(
            image_id=int(uuid.uuid4().int % 10000),  # 仮の画像ID
            recognized=True,
            items=recognized_items
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

# 画像認識処理（通信テスト用）
def image_api_test(image: Image.Image):
    """ 画像を処理して食品を認識する（仮のロジック） """
    items = [
        {"name": "牛乳", "quantity": "1", "unit": "L", "expiration_date": "2025-03-01"},
        {"name": "卵", "quantity": "12", "unit": "個", "expiration_date": "2025-03-05"},
    ]
    return items



# YOLO モデルによる物体検出
def detect_objects(image: Image.Image):
    """
    画像内の食品を検出する
    """
    # PIL画像をOpenCV形式に変換
    image_cv = np.array(image)
    image_cv = cv2.cvtColor(image_cv, cv2.COLOR_RGB2BGR)
    # YOLOで物体検出
    results = model(image_cv)
    detected_items = []
    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])  # クラスID
            conf = float(box.conf[0])  # 信頼度
            label = model.names[cls_id]  # クラス名
            # 0.5 以上の信頼度を持つ食品のみを抽出
            if conf > 0.5:
                detected_items.append({
                    "name": label,
                    "confidence": conf
                })

    return detected_items