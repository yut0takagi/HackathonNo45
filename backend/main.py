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
import base64
import uuid
import re
import asyncio  # 非同期処理のために追加
from dotenv import load_dotenv
from typing import Optional
from fastapi.responses import JSONResponse

app = FastAPI()

load_dotenv()

DB_NAME = os.getenv("POSTGRES_DB", "mydatabase")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "db")  # Docker Compose 内でのサービス名
DB_PORT = os.getenv("DB_PORT", "5432")


openai_api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=openai_api_key)
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

@app.get("/fridge_data/{uid}")
def get_fridge_data(uid: str):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = """
            SELECT ingredient_id, name, genre, icon, quantity, expiration
            FROM fridge WHERE uid = %s;
        """  # ✅ ingredient_id を追加
        cur.execute(query, (uid,))
        rows = cur.fetchall()

        # データを辞書のリストに変換
        data = [
            {
                "id": row[0],  # ✅ ingredient_id に修正
                "name": row[1],
                "genre": row[2],
                "icon": row[3],
                "quantity": row[4],
                "nearestExpiration": row[5]
            }
            for row in rows
        ]

        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


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
                "created_at": row[3],
            }
            for row in rows
        ]
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# --- 新たなエンドポイント: /menu/{uid} --- #
@app.get("/menu/{uid}")
def get_menu(uid: str):
    # DBから冷蔵庫内の食材データを取得
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # テーブル 'fridge_contents' の 'ingredient' カラムから食材データを取得する例
        query = "SELECT name FROM fridge WHERE uid = %s;"
        cur.execute(query, (uid,))
        rows = cur.fetchall()
        ingredients = [row[0] for row in rows]
        if not ingredients:
            raise HTTPException(
                status_code=404,
                detail="指定されたUIDの食材データが見つかりませんでした。",
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

    # 固定のJSON出力フォーマットを指定したプロンプトを作成
    prompt = (
        "以下の食材リストを使用して、一人暮らしでも簡単に作れる料理のメニューを3つ提案してください。\n"
        "出力は以下のJSONフォーマットに厳密に従い、他の余計なテキストを一切含めないこと。\n\n"
        "【JSONフォーマット】\n"
        "{\n"
        '  "menus": [\n'
        "    {\n"
        '      "name": "料理名",\n'
        '      "ingredients": ["食材1", "食材2", ...],\n'
        '      "instructions": "作り方の手順"\n'
        "    },\n"
        "    ...\n"
        "  ]\n"
        "}\n\n"
        f"食材リスト: {', '.join(ingredients)}"
    )

    # OpenAI API を呼び出してメニュー提案を取得
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        generated_text = response.choices[0].message.content.strip()
        # 返却されたテキストが指定のJSON形式であることを前提としてパース
        menu_json = json.loads(generated_text)
        return menu_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# 画像認識
@app.post("/images/")
async def get_image_data(image_request: ImageRequest):
    base64_image = image_request.image_base64
    try:
        response = openai.chat.completions.create(  # ✅ 最新APIの書き方
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "この画像に写っている食材をJSON形式で出力してください。"},
                        {"type": "text","text": """ただし、出力は **絶対に** 以下のフォーマットに従ってください。
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
                         
                            **余計な説明は一切追加しないこと。**
                        """},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=2000
        )

        print("OpenAI API Response:", response)

        if not response.choices or not response.choices[0].message:
            raise ValueError("OpenAI API のレスポンスが無効です")

        json_str = response.choices[0].message.content  # 文字列
        json_str = re.sub(r"```json\n|\n```", "", json_str).strip()

        try:
            parsed_json = json.loads(json_str)
        except json.JSONDecodeError:
            raise ValueError(f"JSONのデコードに失敗しました: {json_str}")

        return JSONResponse(content={"recognized": True, "data": parsed_json})  # JSONとして返す


    except Exception as e:
        print(f"エラー発生: {str(e)}")  # 🚀 ログにエラーを出力
        return JSONResponse(content={"error": str(e)}, status_code=500)



def json_string_to_dict(json_string: str):
    """JSON形式の文字列をPythonの辞書に変換"""
    try:
        json_dict = json.loads(json_string)
        return json_dict
    except json.JSONDecodeError as e:
        print(f"JSONのデコードに失敗しました: {e}")
        return None

# データをデータベースに保存
@app.post("/savedata/{uid}")
async def save_data_from_frontend_to_db(uid: str, request: Request):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # フロントエンドからのJSONデータを取得
        data = await request.json()  # ← await を追加

        # 冷蔵庫データをデータベースに保存
        for item in data["items"]:
            ingredient_id = str(uuid.uuid4())

            query = """
                INSERT INTO fridge 
                (uid, ingredient_id, name, genre, icon, quantity, expiration)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cur.execute(query, (
                uid,
                ingredient_id,
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
