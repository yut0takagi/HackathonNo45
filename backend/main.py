from fastapi import FastAPI
from api.endpoints import users

app = FastAPI(
    title="FastAPI Template",
    description="This is a sample FastAPI template",
    version="1.0.0"
)

# ユーザー関連のルーターを /users プレフィックスで登録
app.include_router(users.router, prefix="/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Template"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
