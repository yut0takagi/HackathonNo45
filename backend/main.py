from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, File, UploadFile, Request
import shutil
from pydantic import BaseModel
import psycopg2
import os
import cv2
import pytesseract
import openai
import json
from dotenv import load_dotenv
from typing import Optional

app = FastAPI()

load_dotenv()

DB_NAME = os.getenv("POSTGRES_DB", "mydatabase")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "db")  # Docker Compose 内でのサービス名
DB_PORT = os.getenv("DB_PORT", "5432")


openai_api_key = os.getenv("OPENAI_API_KEY")
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True) # 写真をアップロードするdir

def get_db_connection():
    return psycopg2.connect(
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )

# class UserData(BaseModel):
#     uid: str
#     data: str

class User(BaseModel):
    uid: str
    display_name: Optional[str] = None
    email: Optional[str] = None

class ImageRequest(BaseModel):
    image_base64: str

class Refrigerator(BaseModel):
    uid: str
    name: str
    genre: str
    icon: str
    quantity: int
    Expiration: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.post("/user_data/")
# def create_user_data(user_data: UserData):
#     conn = get_db_connection()
#     cur = conn.cursor()
#     try:
#         query = "INSERT INTO user_data (uid, data) VALUES (%s, %s) RETURNING id;"
#         cur.execute(query, (user_data.uid, user_data.data))
#         new_id = cur.fetchone()[0]
#         conn.commit()
#         return {"id": new_id, "uid": user_data.uid, "data": user_data.data}
#     except Exception as e:
#         conn.rollback()
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         cur.close()
#         conn.close()

# @app.get("/user_data/{uid}")
# def get_user_data(uid: str):
#     conn = get_db_connection()
#     cur = conn.cursor()
#     try:
#         query = "SELECT id, data, created_at FROM user_data WHERE uid = %s;"
#         cur.execute(query, (uid,))
#         rows = cur.fetchall()
#         data = [{"id": row[0], "data": row[1], "created_at": row[2]} for row in rows]
#         return {"uid": uid, "data": data}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         cur.close()
#         conn.close()


@app.post("/users/")
def create_user(user: User):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "INSERT INTO users (uid, display_name, email) VALUES (%s, %s, %s);"
        cur.execute(query, (user.uid, user.display_name or None, user.email or None))
        conn.commit()
        return {"message": "User created successfully", "uid": user.uid}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@app.get("/users/")
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT uid, display_name, email, created_at FROM users;"
        cur.execute(query)
        rows = cur.fetchall()
        users = [
            {
                "uid": row[0],
                "display_name": row[1],
                "email": row[2],
                "created_at": row[3]
            }
            for row in rows
        ]
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# 画像認識
@app.post("/images/")
async def get_image_data(image_request: ImageRequest):
    try:
        response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "この画像に写っている食材をJSON形式で出力してください。"},
                    {"type": "text","text": """ただし、json形式は以下のようにしてください。
                    {
                        "recognized": true(読み取れたか,読み取れなかったか),
                        "ingredients": [
                            {
                            "id": "1(通し番号)",
                            "name": "ブロッコリー(食材名)",
                            "genre": "野菜(食材カテゴリー)",
                            "icon": "🥦(絵文字をbase64の形式で)",
                            "quantity": 3,
                            "nearestExpiration": "2025/03/20",
                            },
                            {
                            "id": "2(通し番号)",
                            "name": "トマト",
                            "genre": "野菜",
                            "icon": "🍅",
                            "quantity": 5,
                            "nearestExpiration": "2025/03/15",
                            },
                            {
                            "id": "3(通し番号)",
                            "name": "ニンジン",
                            "genre": "野菜",
                            "icon": "🥕",
                            "quantity": 2,
                            "nearestExpiration": "2025/03/10",
                            }
                        ]
                        }
                    """},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_request}"}
                    }
                ]
            }
        ],
        max_tokens=800  # 余裕を持って増やす
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        json_str = response["choices"][0]["message"]["content"]
        json_file = json_string_to_dict(json_str)
        return json_file



def json_string_to_dict(json_string: str):
    """JSON形式の文字列をPythonの辞書に変換"""
    try:
        json_dict = json.loads(json_string)
        return json_dict
    except json.JSONDecodeError as e:
        print(f"JSONのデコードに失敗しました: {e}")
        return None

# データをデータベースに保存
@app.post("/savedata/")
async def save_data_from_frontend_to_db(request: Request):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # フロントエンドからのJSONデータを取得
        data = await request.json()  # ← await を追加

        # 冷蔵庫データをデータベースに保存
        for item in data["items"]:
            query = """
                INSERT INTO refrigerator 
                (uid, name, genre, icon, quantity, expiration)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cur.execute(query, (
                item["uid"],
                item["name"], 
                item["genre"],
                item["icon"],
                item["quantity"],
                item["nearestExpiration"]
            ))

        conn.commit()
        return {"message": "Data saved successfully!"}
    
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    
    finally:
        cur.close()
        conn.close()