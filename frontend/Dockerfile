# Node.js 20 を使用
FROM node:20-alpine

WORKDIR /app

# Next.js のプロジェクトディレクトリをコピー
COPY my-app/package.json my-app/yarn.lock* my-app/package-lock.json* ./

# 依存関係をインストール
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

# Next.js のソースコードをコピー
COPY my-app ./

# ホットリロード用に Next.js を開発モードで起動
CMD ["npm", "run", "dev"]
