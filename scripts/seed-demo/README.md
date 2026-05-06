# Demo Seed Script (one-shot, throw-away)

Generates 1 real post (caption + image) per niche by replicating the **exact
4-step pipeline** of the social-media-backend:

1. Content Planner → `{topic, caption, imageDescription}` (Gemini text)
2. Visual Plan → `{headline, subtitle, bullets, style, colorScheme}` (Gemini text)
3. Image Creative → English image prompt (Gemini text)
4. Image Generation → PNG 1080×1350 (Gemini nano banana image)

Each niche simulates a real paying client with brand context + visual DNA,
so the output matches what a production client would get.

## Run

```bash
export GEMINI_API_KEY=AIza...              # your Google AI Studio key
cd scripts/seed-demo
pip install -r requirements.txt
python generate.py                          # all 8 niches (~5 min, ~$0.35)
python generate.py fitness tecnologia       # only specific niches
```

## Outputs

- `public/assets/demo/<niche>.png` — image per niche (3:4 portrait)
- `src/app/landing/demo-posts.data.ts` — TypeScript constant with captions
- `scripts/seed-demo/.cache/<niche>.json` — intermediate artifacts (for debug/retry)

## Caching

If a niche is interrupted mid-pipeline, re-running will resume from the
cached step. Delete `.cache/<niche>.json` to force re-generation.

## After success

1. Review images in `public/assets/demo/` — regenerate any you don't like
   by deleting `<niche>.png` + the `.cache/<niche>.json` entry and rerunning
2. `git add public/assets/demo src/app/landing/demo-posts.data.ts`
3. Commit and deploy
4. **Delete this folder** (`scripts/seed-demo/`) — it was disposable

## Models

Defaults mirror the backend (`gemini-2.5-flash` for text,
`gemini-2.5-flash-image-preview` for nano banana).

Override via env:

```bash
GEMINI_TEXT_MODEL=gemini-2.5-pro \
GEMINI_IMAGE_MODEL=imagen-4.0-generate-001 \
python generate.py
```
