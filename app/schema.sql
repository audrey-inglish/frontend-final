-- Simple schema for demonstration
-- Simple schema for demonstration (compatible with older Postgres clients)
CREATE TABLE IF NOT EXISTS app_user (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES app_user(id) ON DELETE CASCADE,
  title VARCHAR(60) NOT NULL,
  description VARCHAR(300),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS note_upload (
  id SERIAL PRIMARY KEY,
  dashboard_id INT REFERENCES dashboard(id) ON DELETE CASCADE,
  title VARCHAR(60) NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS concept (
  id SERIAL PRIMARY KEY,
  dashboard_id INT REFERENCES dashboard(id) ON DELETE CASCADE,
  concept_text TEXT NOT NULL,
  ai_summary TEXT,
  mastery_score FLOAT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flashcard_set (
  id SERIAL PRIMARY KEY,
  dashboard_id INT REFERENCES dashboard(id) ON DELETE CASCADE,
  title VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS flashcard (
  id SERIAL PRIMARY KEY,
  flashcard_set_id INT REFERENCES flashcard_set(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  mastery_score FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz (
  id SERIAL PRIMARY KEY,
  dashboard_id INT REFERENCES dashboard(id) ON DELETE CASCADE,
  title VARCHAR(60) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  score float -- most recent user score
);

CREATE TABLE IF NOT EXISTS quiz_question (
  id SERIAL PRIMARY KEY,
  quiz_id INT REFERENCES quiz(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  user_answer TEXT,
  correct_answer TEXT NOT NULL,
  ai_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_answer (
  id SERIAL PRIMARY KEY,
  quiz_question_id INT REFERENCES quiz_question(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN
);

CREATE TABLE IF NOT EXISTS performance_metric (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES app_user(id) ON DELETE CASCADE,
  concept_id INT REFERENCES concept(id) ON DELETE CASCADE,
  sessions_completed INT DEFAULT 0,
  average_score FLOAT DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  time_spent INT DEFAULT 0, -- in seconds
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);