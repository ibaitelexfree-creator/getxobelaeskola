# Semantic Cache Instructions

## Prerequisites

1.  **Dependencies**: Ensure `openai` is installed (`npm install`).
2.  **Environment**: Add `OPENAI_API_KEY` to your `.env.local` file.
    ```env
    OPENAI_API_KEY=sk-proj-...
    ```

## Database Setup

You must apply the migration file to your Supabase database to create the `semantic_cache` table and vector search functions.

**Option A: Supabase CLI**
Run the following command in your terminal:
```bash
npx supabase db push
```

**Option B: SQL Editor**
1.  Open your Supabase Dashboard.
2.  Go to the **SQL Editor**.
3.  Copy the content of `supabase/migrations/20260222_semantic_cache.sql`.
4.  Run the query.

## Verification

You can test the semantic cache using the included demo API route.

1.  Start the development server:
    ```bash
    npm run dev
    ```

2.  Make a request to the demo endpoint:
    ```bash
    curl -X POST http://localhost:3000/api/ai/cache-demo \
      -H "Content-Type: application/json" \
      -d '{"query": "Explain semantic caching", "simulate_response": "It saves tokens by reusing answers."}'
    ```

3.  Make the **same request again**. You should see `"source": "cache"` in the response.
