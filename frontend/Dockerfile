# 依存関係のインストール用ステージ
FROM node:18-alpine AS deps
WORKDIR /app
# package.json とロックファイルをコピー（npmもしくはyarnに対応）
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

# アプリケーションのビルド用ステージ
FROM node:18-alpine AS builder
WORKDIR /app
# ソースコード全体をコピー
COPY . .
# 依存関係を前のステージからコピー
COPY --from=deps /app/node_modules ./node_modules
# Next.jsアプリのビルド（yarn or npm）
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# プロダクション用実行環境のステージ
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
EXPOSE 3000
# 必要なファイルのみコピー
# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
# package.json のコピーを追加
COPY --from=deps /app/package.json ./
# Next.jsアプリの起動
CMD ["yarn", "start"]
