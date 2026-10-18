#!/usr/bin/env python3
"""Build local artwork and a whitelisted Chrome Web Store upload ZIP."""
import hashlib
import json
from pathlib import Path
import zipfile

from PIL import Image, ImageDraw, ImageFont


RELEASE = Path(__file__).resolve().parent
EXTENSION = RELEASE.parent
ASSETS = RELEASE / "assets"
ICONS = EXTENSION / "icons"
ASSETS.mkdir(exist_ok=True)
ICONS.mkdir(exist_ok=True)


def font(size, mono=False):
    family = "NotoSansMono-Bold.ttf" if mono else "NotoSans-Bold.ttf"
    return ImageFont.truetype(str(Path("/usr/share/fonts/noto") / family), size)


icon = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
draw = ImageDraw.Draw(icon)
mint, ink = "#75d9bc", "#10251e"
draw.rounded_rectangle((128, 128, 896, 896), radius=176, fill=mint)
draw.text((512, 494), "64", font=font(360, mono=True), fill=ink, anchor="mm", stroke_width=0)
draw.line((320, 248, 704, 248), fill=ink, width=32)
draw.polygon(((646, 198), (714, 248), (646, 298)), fill=ink)
draw.line((320, 776, 704, 776), fill=ink, width=32)
draw.polygon(((378, 726), (310, 776), (378, 826)), fill=ink)
for size in (16, 32, 48, 128):
    icon.resize((size, size), Image.Resampling.LANCZOS).save(ICONS / f"icon{size}.png")

# Promotional artwork is branding, not a substitute for real UI screenshots.
scale = 3
promo = Image.new("RGB", (440 * scale, 280 * scale), "#11191e")
draw = ImageDraw.Draw(promo)
draw.rounded_rectangle((18 * scale, 18 * scale, 422 * scale, 262 * scale),
                       radius=18 * scale, outline="#354d53", width=scale)
promo.paste(icon.resize((144 * scale, 144 * scale), Image.Resampling.LANCZOS),
            (26 * scale, 52 * scale),
            icon.resize((144 * scale, 144 * scale), Image.Resampling.LANCZOS))
draw.text((182 * scale, 78 * scale), "Offline", font=font(32 * scale), fill="#e4edf0")
draw.text((182 * scale, 119 * scale), "Base64", font=font(32 * scale), fill=mint)
draw.text((37 * scale, 214 * scale), "Encode · Decode · Reverse", font=font(17 * scale), fill="#b0c1c8")
promo.resize((440, 280), Image.Resampling.LANCZOS).save(ASSETS / "promo-440x280.png")

manifest = json.loads((EXTENSION / "manifest.json").read_text())
assert manifest["manifest_version"] == 3
assert len(manifest["description"]) <= 132
assert not manifest.get("permissions") and not manifest.get("host_permissions")
assert "connect-src 'none'" in manifest["content_security_policy"]["extension_pages"]
files = ["manifest.json", "popup.html", "popup.css", "popup.js"]
files += [f"icons/icon{size}.png" for size in (16, 32, 48, 128)]
package = RELEASE / f"offline-base64-{manifest['version']}.zip"
with zipfile.ZipFile(package, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        info = zipfile.ZipInfo(name, date_time=(2026, 10, 18, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, (EXTENSION / name).read_bytes())
with zipfile.ZipFile(package) as archive:
    assert archive.testzip() is None
    assert archive.namelist() == files
    assert json.loads(archive.read("manifest.json")) == manifest
digest = hashlib.sha256(package.read_bytes()).hexdigest()
(RELEASE / "SHA256SUMS.txt").write_text(f"{digest}  {package.name}\n")
print(f"Built {package.name}: {package.stat().st_size:,} bytes; {len(files)} runtime files.")
print("Icon PNGs and 440x280 promotional image generated. No screenshots fabricated.")
