# from fastapi import FastAPI
# from api.endpoints import users
# from fastapi.middleware.cors import CORSMiddleware



# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # すべてのオリジンを許可（本番環境では制限すべき）
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ユーザー関連のルーターを /users プレフィックスで登録
# app.include_router(users.router, prefix="/users", tags=["users"])

# @app.get("/")
# async def root():
#     return {"message": "Welcome to FastAPI Template"}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/users/")
def get_users():
    return [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
