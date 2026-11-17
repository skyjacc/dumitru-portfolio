"""Export the generated v4 phone without cropping or creative pixel changes.

First run: python scripts/prepare-phone-v4.py --source <generated-master.png>
Later runs reuse the ignored qa/phone-v4/master.png copy.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil

from PIL import Image


def main():
    root = Path(__file__).resolve().parents[1]
    master = root / "qa/phone-v4/master.png"
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=master)
    args = parser.parse_args()
    source = args.source.resolve()
    if not source.is_file():
        parser.error(f"Missing master: {source}. Supply --source on the first run.")

    output = root / "site/hero/desk/v4"
    (output / "responsive").mkdir(parents=True, exist_ok=True)
    master.parent.mkdir(parents=True, exist_ok=True)
    if source != master.resolve():
        shutil.copy2(source, master)

    with Image.open(master) as opened:
        image = opened.convert("RGBA")
    alpha = image.getchannel("A")
    full = output / "phone.webp"
    image.save(full, lossless=True, method=6, exact=True)
    # The full-size WebP must preserve every RGBA pixel, including transparency.
    with Image.open(full) as decoded:
        if decoded.convert("RGBA").tobytes() != image.tobytes():
            raise RuntimeError("Full-size lossless WebP did not preserve RGBA pixels")

    variants = []
    for width in (256, 384, 512, 768, 1024):
        height = round(image.height * width / image.width)
        destination = output / "responsive" / f"phone-{width}.webp"
        image.resize((width, height), Image.Resampling.LANCZOS).save(
            destination, lossless=True, method=6, exact=True
        )
        variants.append({
            "src": f"/hero/desk/v4/responsive/{destination.name}",
            "width": width,
            "height": height,
            "bytes": destination.stat().st_size,
        })
    variants.append({
        "src": "/hero/desk/v4/phone.webp",
        "width": image.width,
        "height": image.height,
        "bytes": full.stat().st_size,
    })
    manifest = {"phone": {
        "canvas": list(image.size),
        "alpha_bbox": alpha.getbbox(),
        "visible_bbox_alpha16": alpha.point(lambda value: 255 if value >= 16 else 0).getbbox(),
        "opaque_bbox_alpha128": alpha.point(lambda value: 255 if value >= 128 else 0).getbbox(),
        "crop": None,
        "master": "qa/phone-v4/master.png",
        "master_sha256": hashlib.sha256(master.read_bytes()).hexdigest(),
        "output": "site/hero/desk/v4/phone.webp",
        "full_size_rgba_preserved": True,
        "variants": variants,
    }}
    encoded = json.dumps(manifest, indent=2) + "\n"
    (output / "manifest.json").write_text(encoded, encoding="utf-8")
    (master.parent / "manifest.json").write_text(encoded, encoding="utf-8")
    print(encoded)


if __name__ == "__main__":
    main()
