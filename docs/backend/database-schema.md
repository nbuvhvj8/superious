# Database Schema (Supabase)

Superious uses **Supabase (Postgres)** for data persistence. The schema is optimized for multi-user isolation and efficient retrieval of job-related data.

## 📊 Core Tables

### 1. `jobs`
Stores the primary research request and status.
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK to auth.users)
- `prompt`: Text (The original user input)
- `status`: Enum (pending, researching, writing, completed, failed)
- `template`: Enum (youtube, reel, etc.)
- `created_at`: Timestamp
- `completed_at`: Timestamp

### 2. `sources`
Stores metadata and content of retrieved research sources.
- `id`: UUID (Primary Key)
- `job_id`: UUID (FK to jobs)
- `url`: Text
- `title`: Text
- `snippet`: Text
- `content`: Text (Markdown)
- `summary`: Text (AI generated)
- `screenshot_path`: Text (Path in Supabase Storage)
- `rank_score`: Numeric

### 3. `scripts`
Stores the final generated script and its segments.
- `id`: UUID (Primary Key)
- `job_id`: UUID (FK to jobs, 1:1)
- `segments`: JSONB (Array of script segments with narration and B-roll)
- `metadata`: JSONB (Word count, duration, etc.)

### 4. `user_settings`
Encrypted API keys and user preferences.
- `user_id`: UUID (Primary Key, FK to auth.users)
- `encrypted_keys`: JSONB (AES-256-GCM encrypted strings)
- `preferences`: JSONB (Default model, research depth, etc.)

## 🛡️ Row Level Security (RLS)

RLS is enabled on **all** tables from day one. Users can only see and modify their own data.

```sql
-- Example RLS Policy for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only create their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 📜 Migrations Strategy

- All schema changes must be documented in `supabase/migrations/`.
- Use `supabase db diff` to generate SQL for changes made in the dashboard.
- Migrations are version-controlled and applied sequentially in CI/CD.
