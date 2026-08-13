# Activating the AI Decision Engine

Add these variables in Vercel → Project → Settings → Environment Variables for **Production** and **Preview**. Never put secret values in the browser or GitHub.

## Required for live analysis
- `ANTHROPIC_API_KEY`: Claude API key. Activates signal explanations, scorecards, complaint mining, listing rewrite, creator briefs, reports, and analyst chat.
- `JUSTONEAPI_TOKEN`: Activates live China/platform data pulls.

## Required for accounts and credits
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Required for checkout
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Required for image cleanup and MT
- `LISTING_WORKER_URL`: deployed URL of workers/listing_worker.py.

The app is deliberately honest while unconfigured: API routes return `setupRequired` rather than manufacture fake AI output or debit fake credits.
