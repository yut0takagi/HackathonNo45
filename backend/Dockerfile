# Python公式イメージ（軽量なslim版）を利用
FROM python:3.9-slim

WORKDIR /app

# 依存関係ファイルを先にコピーし、キャッシュを活用
COPY requirements.txt .

# pipのアップグレードと必要パッケージのインストール
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# アプリケーションのソースコードをコピー
COPY . .

# uvicornでFastAPIアプリケーションを起動（main.py内のappを参照）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
