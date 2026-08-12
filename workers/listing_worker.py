# Listing worker — the heavy image/MT service for the listing pipeline.
# Deploy as a tiny Python web service (Railway / Render / Fly). Needs: rembg, pillow,
# transformers, torch, sentencepiece, fastapi, uvicorn, requests.
#
# Env: none required. Exposes POST /build.
#
#   POST /build  { "images": [urls], "title": "zh title", "desc": "zh desc" }
#   -> { "cleaned_images": ["/files/abc1.png"], "title_en": "...", "desc_en": "...", "bullets": [...] }
#
# rembg removes backgrounds (u2net) and auto-crops; Helsinki opus-mt-zh-en translates;
# a light template pass turns the translated title into selling bullets.

import io, os, uuid, re, threading
from fastapi import FastAPI
from pydantic import BaseModel
import requests
from PIL import Image

app = FastAPI()
OUT = os.environ.get("OUT_DIR", "/tmp/listing_files")
os.makedirs(OUT, exist_ok=True)

_rembg = None
_mt = None
_lock = threading.Lock()

def get_rembg():
    global _rembg
    with _lock:
        if _rembg is None:
            from rembg import remove
            _rembg = remove
    return _rembg

def get_mt():
    global _mt
    with _lock:
        if _mt is None:
            from transformers import pipeline
            _mt = pipeline("translation", model="Helsinki-NLP/opus-mt-zh-en")
    return _mt

class Build(BaseModel):
    images: list[str] = []
    title: str = ""
    desc: str = ""

def clean_image(url: str) -> str | None:
    try:
        img_bytes = requests.get(url, timeout=30).content
        inp = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
        out = get_rembg()(inp)
        bbox = out.getbbox()
        if bbox: out = out.crop(bbox)
        white = Image.new("RGBA", out.size, (255, 255, 255, 255))
        white.paste(out, (0, 0), out)
        name = f"{uuid.uuid4().hex}.png"
        white.convert("RGB").save(os.path.join(OUT, name))
        return f"/files/{name}"
    except Exception:
        return None

def to_english(text: str) -> str:
    if not text.strip(): return ""
    try:
        return get_mt()(text[:512])[0]["translation_text"]
    except Exception:
        return text

def bullets_from(title_en: str, desc_en: str) -> list[str]:
    # light heuristic bullets from the translated copy — the LLM rewrite happens at the app layer
    feats = []
    t = title_en.lower()
    if any(k in t for k in ["steam", "mist", "spray"]): feats.append("Fine-mist technology for gentler, more effective use")
    if any(k in t for k in ["electric", "usb", "rechargeable"]): feats.append("Rechargeable and cordless for everyday convenience")
    if any(k in t for k in ["pet", "cat", "dog"]): feats.append("Designed for pets — gentle on skin and coat")
    if any(k in t for k in ["massage", "comb", "brush"]): feats.append("Detangles and massages in a single pass")
    feats.append("Sourced direct from the manufacturer for the best margin")
    return feats[:5]

@app.post("/build")
def build(b: Build):
    cleaned = [p for p in (clean_image(u) for u in b.images) if p]
    title_en = to_english(b.title)
    desc_en = to_english(b.desc)
    return {
        "cleaned_images": cleaned,
        "title_en": title_en,
        "desc_en": desc_en,
        "bullets": bullets_from(title_en, desc_en),
    }

@app.get("/health")
def health():
    return {"ok": True}

# Serve cleaned files
from fastapi.staticfiles import StaticFiles
app.mount("/files", StaticFiles(directory=OUT), name="files")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
