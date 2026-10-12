#!/usr/bin/env python3
"""Génère les icônes de l'application (PWA + Android).

Produit :
  docs/icons/icon.svg               icône vectorielle
  docs/icons/icon-192.png           PWA standard
  docs/icons/icon-512.png           PWA standard
  docs/icons/icon-maskable-512.png  PWA masquable (avec marge de sécurité)
  android/.../ic_launcher.png       Density -> icônes du lanceur Android

Motif : une assiette blanche sur fond vert, avec une feuille verte
        (le frais avant tout) et une carotte en accent.

Usage : python3 scripts/gen_icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
VERT = (46, 125, 50, 255)      # --vert
VERT_CLAIR = (76, 175, 80, 255)
ORANGE = (239, 108, 0, 255)    # --orange
BLANC = (255, 255, 255, 255)


def _coeur(survol: float = 1.0):
    """Feuille : ellipse inclinée, dessinée sur son propre calque."""
    n = 200
    calque = Image.new("RGBA", (n * 2, n * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(calque)
    d.ellipse([n * 0.30, n * 0.86, n * 1.70, n * 1.42], fill=VERT_CLAIR)
    calque = calque.rotate(-38, resample=Image.BICUBIC, center=(n, n))
    return calque, n


def dessiner(taille: int, marge: float = 0.0) -> Image.Image:
    """Icône carrée. `marge` réserve la zone sûre des icônes masquables."""
    img = Image.new("RGBA", (taille, taille), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # fond : carré à coins arrondis
    d.rounded_rectangle([0, 0, taille - 1, taille - 1],
                        radius=int(taille * 0.22), fill=VERT)

    # marge de sécurité pour les icônes « maskable »
    t = taille * (1 - 2 * marge)
    cx = taille / 2
    cy = taille / 2 + t * 0.10

    # assiette
    r = t * 0.30
    d.ellipse([cx - r, cy - r * 0.82, cx + r, cy + r * 0.82], fill=BLANC)
    d.ellipse([cx - r * 0.62, cy - r * 0.52, cx + r * 0.62, cy + r * 0.36],
              outline=(210, 225, 210, 255), width=max(2, int(taille * 0.006)))

    # feuille verte posée dans l'assiette
    feuille, n = _coeur()
    taille_feuille = int(t * 0.46)
    feuille = feuille.resize((taille_feuille, taille_feuille), Image.LANCZOS)
    img.alpha_composite(feuille,
                        (int(cx - taille_feuille / 2), int(cy - taille_feuille * 0.60)))

    # carotte en accent, en bas à droite
    lg = int(taille * 0.030)
    d.polygon([
        (cx + r * 0.34, cy + r * 0.52),
        (cx + r * 0.86, cy + r * 0.52),
        (cx + r * 0.60, cy - r * 0.42),
    ], fill=ORANGE)
    d.line([(cx + r * 0.74, cy - r * 0.42),
            (cx + r * 0.88, cy - r * 0.62)], fill=VERT_CLAIR, width=lg)
    d.line([(cx + r * 0.66, cy - r * 0.42),
            (cx + r * 0.70, cy - r * 0.66)], fill=VERT_CLAIR, width=lg)
    return img


SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img"
     aria-label="MonStock">
  <rect width="512" height="512" rx="112" fill="#2e7d32"/>
  <ellipse cx="256" cy="282" rx="154" ry="126" fill="#ffffff"/>
  <ellipse cx="256" cy="266" rx="95" ry="68" fill="none" stroke="#d2e1d2" stroke-width="4"/>
  <ellipse cx="256" cy="236" rx="88" ry="36" fill="#4caf50"
           transform="rotate(-38 256 236)"/>
  <polygon points="345,347 425,347 369,231" fill="#ef6c00"/>
  <line x1="405" y1="231" x2="440" y2="205" stroke="#4caf50" stroke-width="14"
        stroke-linecap="round"/>
  <line x1="365" y1="231" x2="382" y2="196" stroke="#4caf50" stroke-width="14"
        stroke-linecap="round"/>
</svg>
"""


def main() -> None:
    icons = ROOT / "docs" / "icons"
    icons.mkdir(parents=True, exist_ok=True)
    (icons / "icon.svg").write_text(SVG, encoding="utf-8")

    for taille in (192, 512):
        dessiner(taille).save(icons / ("icon-%d.png" % taille), "PNG")
    dessiner(512, marge=0.12).save(icons / "icon-maskable-512.png", "PNG")

    # icônes du lanceur Android
    densites = {
        "mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192
    }
    base = ROOT / "android" / "app" / "src" / "main" / "res"
    for densite, px in densites.items():
        dossier = base / ("mipmap-" + densite)
        if not dossier.exists():
            continue
        img = dessiner(px)
        for nom in ("ic_launcher.png", "ic_launcher_round.png"):
            img.save(dossier / nom, "PNG")

    print("Icônes générées :", icons.relative_to(ROOT))
    for f in sorted(icons.iterdir()):
        print("  ", f.name, f.stat().st_size, "octets")


if __name__ == "__main__":
    main()