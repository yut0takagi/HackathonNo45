-- init.sql
CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    display_name TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_data (
    id SERIAL PRIMARY KEY,
    uid TEXT REFERENCES users(uid),
    data TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
