# Backend Data Models (Supabase/Postgres)

## 1. `jobs` Table
Main orchestrator for research requests.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique job identifier |
| `user_id` | uuid (FK) | References `auth.users` |
| `prompt` | text | Raw user input/topic |
| `status` | enum | `queued`, `researching`, `screenshotting`, `writing`, `done`, `failed` |
| `error` | text | Error message if failed |
| `created_at` | timestamptz | Auto-timestamp |

## 2. `sources` Table
Evidence gathered during the research phase.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique source identifier |
| `job_id` | uuid (FK) | References `jobs.id` (CASCADE) |
| `url` | text | Source URL |
| `title` | text | Page title at capture time |
| `summary` | text | AI-generated 2-3 sentence summary |
| `screenshot_path` | text | Storage path: `screenshots/{job_id}/{source_id}.png` |
| `status` | enum | `pending`, `done`, `failed` |

## 3. `scripts` Table
The final structured output.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique script identifier |
| `job_id` | uuid (FK) | One-to-one with `jobs.id` |
| `title` | text | AI-generated title |
| `hook` | text | 30s opening hook |
| `segments` | jsonb | Array of `ScriptSegment` objects |
| `outro` | text | Call-to-action |

### `ScriptSegment` Schema (JSONB)
```typescript
interface ScriptSegment {
  order: number;         // 1-indexed
  heading: string;       // Section title
  narration: string;     // VO text
  b_roll_cues: string[]; // Visual suggestions
  source_ids: string[];  // FKs to sources table
  duration_s: number;    // Estimated read time
}
```
