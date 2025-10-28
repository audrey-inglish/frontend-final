-- Simple schema for demonstration
CREATE TABLE IF NOT EXISTS app_user (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO app_user (username)
SELECT 'Demo User'
WHERE NOT EXISTS (SELECT 1 FROM app_user LIMIT 1);
