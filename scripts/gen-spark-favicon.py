"""Generate Spark yellow favicon from Akroma master icon.

Reads ~/Documents/Akroma/Icone Akroma.png (dark-blue glyph on transparent bg),
recolors every opaque pixel to Spark yellow (#fbbf24), and writes:
  public/favicon.ico    (multi-size ICO: 16, 32, 48, 64)
  public/favicon.png    (512x512 PNG)
  public/apple-touch-icon.png (180x180 PNG)
"""
from pathlib import Path
from PIL import Image

SRC = Path(r"C:\Users\Leo Guedes\Documents\Akroma\Icone Akroma.png")
OUT_DIR = Path(__file__).resolve().parents[1] / "public"
YELLOW = (251, 191, 36)  # #fbbf24

def recolor(img: Image.Image, rgb: tuple[int, int, int]) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            _, _, _, a = px[x, y]
            if a > 0:
                px[x, y] = (*rgb, a)
    return img

def main() -> None:
    src = Image.open(SRC)
    yellow_glyph = recolor(src, YELLOW)

    # Master square canvas to center glyph (source may not be square)
    side = max(yellow_glyph.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - yellow_glyph.width) // 2
    oy = (side - yellow_glyph.height) // 2
    canvas.paste(yellow_glyph, (ox, oy), yellow_glyph)

    OUT_DIR.mkdir(exist_ok=True)

    # Full-resolution PNG
    master = canvas.resize((512, 512), Image.LANCZOS)
    master.save(OUT_DIR / "favicon.png", "PNG")
    print(f"wrote {OUT_DIR / 'favicon.png'}")

    # Apple touch icon
    canvas.resize((180, 180), Image.LANCZOS).save(OUT_DIR / "apple-touch-icon.png", "PNG")
    print(f"wrote {OUT_DIR / 'apple-touch-icon.png'}")

    # ICO with multiple sizes so browsers pick the sharpest
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    canvas.save(OUT_DIR / "favicon.ico", format="ICO", sizes=sizes)
    print(f"wrote {OUT_DIR / 'favicon.ico'}")

if __name__ == "__main__":
    main()
