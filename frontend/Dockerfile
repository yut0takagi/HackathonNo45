# Node.js 23 を使用
FROM node:23-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係のキャッシュを利用するため、package.json だけを先にコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをすべてコピー
COPY . .

# ポートを指定（Next.js の場合）
EXPOSE 3000

# アプリを実行
CMD ["npm", "run", "dev"]