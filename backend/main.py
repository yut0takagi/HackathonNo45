from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import os
import openai
import json

app = FastAPI()

DB_NAME = os.getenv("POSTGRES_DB", "mydatabase")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "db")  # Docker Compose 内でのサービス名
DB_PORT = os.getenv("DB_PORT", "5432")


def get_db_connection():
    return psycopg2.connect(
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )


class UserData(BaseModel):
    uid: str
    data: str


class User(BaseModel):
    uid: str
    display_name: str
    email: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/user_data/")
def create_user_data(user_data: UserData):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "INSERT INTO user_data (uid, data) VALUES (%s, %s) RETURNING id;"
        cur.execute(query, (user_data.uid, user_data.data))
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"id": new_id, "uid": user_data.uid, "data": user_data.data}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@app.get("/user_data/{uid}")
def get_user_data(uid: str):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        query = "SELECT id, data, created_at FROM user_data WHERE uid = %s;"
        cur.execute(query, (uid,))
        rows = cur.fetchall()
        data = [{"id": row[0], "data": row[1], "created_at": row[2]} for row in rows]
        return {"uid": uid, "data": data}
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
        cur.execute(query, (user.uid, user.display_name, user.email))
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
        query = "SELECT ingredient FROM fridge_contents WHERE uid = %s;"
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
        response = openai.ChatCompletion.create(
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
