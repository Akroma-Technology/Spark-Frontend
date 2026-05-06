#!/usr/bin/env python3
"""
One-shot demo seed script.

Generates 1 real post (caption + image) per niche by replicating the exact
4-step pipeline of the backend (Content -> VisualPlan -> ImageCreative -> ImageGen).
Calls Gemini directly — does NOT go through the production backend.

Outputs:
  - public/assets/demo/<niche>.png           (3:4 PNG, ~1080x1350)
  - src/app/landing/demo-posts.data.ts       (captions, topic, handle, displayName)
  - scripts/seed-demo/.cache/<niche>.json    (intermediate artifacts for debug)

Usage:
    export GEMINI_API_KEY=AIza...
    cd scripts/seed-demo
    pip install -r requirements.txt
    python generate.py                 # generate all niches
    python generate.py fitness moda    # generate only specific niches

After success: commit the generated PNGs and the .ts file, then delete this
scripts/seed-demo/ folder.

Cost estimate (Gemini 2.5 Flash + Nano Banana image):
  ~$0.04 per niche (3 text calls + 1 image call). 8 niches ~ $0.32 total.
"""

from __future__ import annotations

import base64
import json
import locale
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import requests

from niches import NICHE_CLIENTS
from prompts import (
    DEFAULT_CONTENT,
    DEFAULT_VISUAL_PLAN,
    DEFAULT_IMAGE_CREATIVE,
    pick_forced_style,
)

# ---- Config ----
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
TEXT_MODEL = os.environ.get("GEMINI_TEXT_MODEL", "gemini-3-flash-preview")
IMAGE_MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image-preview")
API_KEY = os.environ.get("GEMINI_API_KEY")

ROOT = Path(__file__).resolve().parents[2]  # akroma-spark/
ASSETS_DIR = ROOT / "public" / "assets" / "demo"
DATA_TS = ROOT / "src" / "app" / "landing" / "demo-posts.data.ts"
CACHE_DIR = Path(__file__).parent / ".cache"


# ---- Helpers ----
def die(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def log(msg: str) -> None:
    print(f"[seed] {msg}", flush=True)


def today_pt_br() -> str:
    """Mirror of backend's 'd de MMMM de yyyy' Portuguese format."""
    months = [
        "janeiro", "fevereiro", "marco", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    ]
    d = datetime.now()
    return f"{d.day} de {months[d.month - 1]} de {d.year}"


def post_json(url: str, body: dict, timeout: int = 180) -> dict:
    """POST JSON to Gemini with basic retry on 429/5xx."""
    last_err: Exception | None = None
    for attempt in range(5):
        try:
            r = requests.post(url, json=body, timeout=timeout,
                              headers={"Content-Type": "application/json"})
            if r.status_code in (429, 500, 502, 503, 504):
                wait = 5 * (attempt + 1)
                log(f"  HTTP {r.status_code}, retrying in {wait}s...")
                time.sleep(wait)
                continue
            r.raise_for_status()
            return r.json()
        except requests.RequestException as e:
            last_err = e
            wait = 5 * (attempt + 1)
            log(f"  request failed ({e!r}), retrying in {wait}s...")
            time.sleep(wait)
    raise RuntimeError(f"Gemini call failed after 5 attempts: {last_err}")


def extract_text(resp: dict) -> str:
    """Pull the first text part out of a generateContent response."""
    candidates = resp.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"no candidates: {json.dumps(resp)[:400]}")
    parts = candidates[0].get("content", {}).get("parts", [])
    for p in parts:
        if "text" in p:
            return p["text"]
    raise RuntimeError(f"no text part in response: {json.dumps(resp)[:400]}")


def extract_image_bytes(resp: dict) -> bytes:
    """Pull the first inlineData image out of a nano-banana response."""
    candidates = resp.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"no candidates: {json.dumps(resp)[:400]}")
    parts = candidates[0].get("content", {}).get("parts", [])
    for p in parts:
        inline = p.get("inlineData") or p.get("inline_data")
        if inline and inline.get("data"):
            return base64.b64decode(inline["data"])
    raise RuntimeError(f"no image in response: {json.dumps(resp)[:400]}")


def parse_json_strict(text: str) -> Any:
    """Parse JSON that may be wrapped in ```json ... ``` fences."""
    t = text.strip()
    if t.startswith("```"):
        # strip opening fence
        t = re.sub(r"^```(?:json)?\s*", "", t)
        # strip closing fence
        t = re.sub(r"\s*```\s*$", "", t)
    return json.loads(t)


# ---- Pipeline steps ----
def call_text_json(prompt: str, label: str) -> Any:
    """Call Gemini text model expecting a JSON response."""
    url = f"{GEMINI_BASE}/models/{TEXT_MODEL}:generateContent?key={API_KEY}"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.9,
            "responseMimeType": "application/json",
        },
    }
    log(f"  -> Gemini text ({label})")
    resp = post_json(url, body)
    text = extract_text(resp)
    return parse_json_strict(text)


def call_text_plain(prompt: str, label: str) -> str:
    """Call Gemini text model expecting plain text (image creative prompt)."""
    url = f"{GEMINI_BASE}/models/{TEXT_MODEL}:generateContent?key={API_KEY}"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.8},
    }
    log(f"  -> Gemini text ({label})")
    resp = post_json(url, body)
    return extract_text(resp).strip()


def call_image(image_prompt: str) -> bytes:
    """Call Gemini nano-banana image model. Returns PNG bytes."""
    url = f"{GEMINI_BASE}/models/{IMAGE_MODEL}:generateContent?key={API_KEY}"
    body = {
        "contents": [{"parts": [{"text": image_prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": "3:4"},
        },
    }
    log(f"  -> Gemini image (nano banana, 3:4)")
    resp = post_json(url, body, timeout=240)
    return extract_image_bytes(resp)


def build_content_prompt(client: dict) -> str:
    brand_section = f"\nCONTEXTO DA MARCA:\n{client['brand_context']}\n"
    hashtag_section = (
        f"\nHASHTAGS OBRIGATORIAS (inclua na legenda):\n{client['fixed_hashtags']}\n"
        if client.get("fixed_hashtags") else ""
    )
    return (DEFAULT_CONTENT
            .replace("{{DATE}}", today_pt_br())
            .replace("{{LANGUAGE}}", "pt-BR")
            .replace("{{SEARCH_DESCRIPTION}}", client["search_description"])
            .replace("{{BRAND_CONTEXT}}", brand_section)
            .replace("{{NEGATIVE_TOPICS}}", "")
            .replace("{{RECENT_TOPICS}}", "")
            .replace("{{FIXED_HASHTAGS}}", hashtag_section)
            .replace("{{TRENDING_CONTEXT}}", "")
            .replace("{{PAST_POSTS}}", ""))


def build_visual_plan_prompt(client: dict, topic: str, image_description: str) -> str:
    forced_style = pick_forced_style(topic)
    brand_section = f"MARCA: {client['brand_context']}\n"
    style_section = f"DNA VISUAL: {client['image_style']}\n"
    return (DEFAULT_VISUAL_PLAN
            .replace("{{TOPIC}}", topic)
            .replace("{{IMAGE_DESCRIPTION}}", image_description)
            .replace("{{LANGUAGE}}", "pt-BR")
            .replace("{{FORCED_STYLE}}", forced_style)
            .replace("{{BRAND_CONTEXT}}", brand_section)
            .replace("{{IMAGE_STYLE}}", style_section))


def build_image_creative_prompt(client: dict, topic: str, visual_plan: dict) -> str:
    text_content_lines = [f"HEADLINE: {visual_plan['headline']}"]
    if visual_plan.get("subtitle"):
        text_content_lines.append(f"SUBTITLE: {visual_plan['subtitle']}")
    if visual_plan.get("bullets"):
        text_content_lines.append("BULLETS: " + " | ".join(visual_plan["bullets"]))
    if visual_plan.get("dataPoints"):
        text_content_lines.append("DATA: " + " | ".join(visual_plan["dataPoints"]))
    text_content = "\n".join(text_content_lines)

    brand_section = f"\nMARCA: {client['brand_context']}\n"
    style_section = f"\nDNA VISUAL: {client['image_style']}\n"

    return (DEFAULT_IMAGE_CREATIVE
            .replace("{{TOPIC}}", topic)
            .replace("{{STYLE}}", visual_plan["style"])
            .replace("{{COLOR_SCHEME}}", visual_plan["colorScheme"])
            .replace("{{TEXT_CONTENT}}", text_content)
            .replace("{{BRAND_CONTEXT}}", brand_section)
            .replace("{{IMAGE_STYLE}}", style_section))


# ---- Main ----
def generate_one(niche: str, client: dict) -> dict:
    log(f"\n=== {niche} ({client['handle']}) ===")

    cache_file = CACHE_DIR / f"{niche}.json"
    cache: dict = {}
    if cache_file.exists():
        cache = json.loads(cache_file.read_text(encoding="utf-8"))

    # Step 1: content
    if "content" not in cache:
        content_prompt = build_content_prompt(client)
        content = call_text_json(content_prompt, "content planner")
        cache["content"] = content
        cache_file.parent.mkdir(exist_ok=True)
        cache_file.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        log("  [cached] content")
    content = cache["content"]
    log(f"  topic: {content['topic']}")

    # Step 2: visual plan
    if "visual_plan" not in cache:
        vp_prompt = build_visual_plan_prompt(client, content["topic"], content["imageDescription"])
        visual_plan = call_text_json(vp_prompt, "visual plan")
        cache["visual_plan"] = visual_plan
        cache_file.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        log("  [cached] visual plan")
    visual_plan = cache["visual_plan"]
    log(f"  style: {visual_plan['style']}  headline: {visual_plan['headline']}")

    # Step 3: image creative prompt
    if "image_prompt" not in cache:
        ic_prompt = build_image_creative_prompt(client, content["topic"], visual_plan)
        image_prompt = call_text_plain(ic_prompt, "image creative")
        cache["image_prompt"] = image_prompt
        cache_file.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        log("  [cached] image prompt")
    image_prompt = cache["image_prompt"]

    # Step 4: image generation
    png_path = ASSETS_DIR / f"{niche}.png"
    if png_path.exists():
        log(f"  [cached] image -> {png_path}")
    else:
        png_bytes = call_image(image_prompt)
        png_path.parent.mkdir(parents=True, exist_ok=True)
        png_path.write_bytes(png_bytes)
        log(f"  saved image -> {png_path} ({len(png_bytes)} bytes)")

    return {
        "niche": niche,
        "handle": client["handle"],
        "displayName": client["display_name"],
        "topic": content["topic"],
        "caption": content["caption"],
        "headline": visual_plan["headline"],
        "imageFile": f"assets/demo/{niche}.png",
    }


def render_ts(results: list[dict]) -> str:
    """Render the TypeScript data file consumed by spark.component.ts."""
    def esc(s: str) -> str:
        return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

    entries = []
    for r in results:
        entries.append(
            "  {\n"
            f"    niche: '{r['niche']}',\n"
            f"    handle: '{esc(r['handle'])}',\n"
            f"    displayName: '{esc(r['displayName'])}',\n"
            f"    topic: `{esc(r['topic'])}`,\n"
            f"    headline: `{esc(r['headline'])}`,\n"
            f"    image: '{esc(r['imageFile'])}',\n"
            f"    caption: `{esc(r['caption'])}`,\n"
            "  },"
        )
    body = "\n".join(entries)
    return (
        "// GENERATED by scripts/seed-demo/generate.py — do not edit by hand.\n"
        "// Each post is a REAL output of the Akroma Spark backend pipeline,\n"
        "// produced once and baked as a fixed asset.\n\n"
        "export interface DemoPostData {\n"
        "  niche: string;\n"
        "  handle: string;\n"
        "  displayName: string;\n"
        "  topic: string;\n"
        "  headline: string;\n"
        "  image: string;\n"
        "  caption: string;\n"
        "}\n\n"
        "export const DEMO_POSTS: DemoPostData[] = [\n"
        f"{body}\n"
        "];\n"
    )


def main() -> None:
    if not API_KEY:
        die("GEMINI_API_KEY env var is required.")

    requested = sys.argv[1:] or list(NICHE_CLIENTS.keys())
    unknown = [n for n in requested if n not in NICHE_CLIENTS]
    if unknown:
        die(f"unknown niches: {unknown}. Valid: {list(NICHE_CLIENTS.keys())}")

    CACHE_DIR.mkdir(exist_ok=True)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    for niche in requested:
        try:
            r = generate_one(niche, NICHE_CLIENTS[niche])
            results.append(r)
        except Exception as e:
            log(f"  FAILED: {e!r}")
            raise

    # Merge with any existing results for niches we didn't regenerate
    if DATA_TS.exists() and len(requested) < len(NICHE_CLIENTS):
        log("\n(partial run — preserving existing entries for non-regenerated niches)")
        existing = DATA_TS.read_text(encoding="utf-8")
        # crude but safe: we only write TS if ALL niches present; otherwise bail
        log("WARNING: partial TS regeneration not supported. Run all niches or edit manually.")
    else:
        DATA_TS.parent.mkdir(parents=True, exist_ok=True)
        DATA_TS.write_text(render_ts(results), encoding="utf-8")
        log(f"\nwrote TS data -> {DATA_TS}")

    log("\nDONE.")
    log(f"  {len(results)} niches generated")
    log(f"  images:    {ASSETS_DIR}")
    log(f"  data file: {DATA_TS}")
    log("\nNext steps:")
    log("  1. git add public/assets/demo src/app/landing/demo-posts.data.ts")
    log("  2. commit, deploy")
    log("  3. (optional) delete scripts/seed-demo/ — it was one-shot")


if __name__ == "__main__":
    main()
