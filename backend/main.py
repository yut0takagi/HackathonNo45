from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import os

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