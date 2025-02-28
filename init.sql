CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    display_name TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fridge (
    id SERIAL PRIMARY KEY,  -- 🔥 一意のIDで管理
    uid TEXT REFERENCES users(uid),
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    icon VARCHAR(10),
    quantity INT NOT NULL,
    expiration DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ✅ トランザクションを使用してデータを確実に挿入
BEGIN;

-- ユーザーの初期データ
INSERT INTO users (uid, display_name, email) 
VALUES ('test123', 'taisei', 'test@gmail.com')
ON CONFLICT (uid) DO NOTHING;

-- 冷蔵庫の初期データ
INSERT INTO fridge (uid, name, genre, icon, quantity, expiration)
VALUES 
    ('test124', 'トマト', '野菜', 'test', 5, '2025-03-15');
COMMIT;
