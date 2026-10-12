#!/usr/bin/env python3
"""Génère les deux QR codes de MonStock.

  qrcode-web.png   → la version web (hébergée sur GitHub Pages)
  qrcode-apk.png   → le téléchargement de l'APK Android

Chaque QR est accompagné d'un PNG « carte » avec un titre et l'URL,
prêt à imprimer ou à afficher.

Usage :
    python3 scripts/gen_qr.py
    python3 scripts/gen_qr.py --web https://... --apk https://...
"""
import argparse
import sys
from pathlib import Path

try:
    import qrcode
    from qrcode.image.pil import PilImage
except ImportError:  # pragma: no cover
    sys.exit("Module 'qrcode' manquant. Installer avec : pip3 install qrcode[pil]")

ROOT = Path(__file__).resolve().parent.parent
SORTIE = ROOT / "docs"

# Valeurs par défaut : adaptées si les URL changent.
URL_WEB_DEF = "https://manonlacombe.github.io/monstock/"
URL_APK_DEF = "https://github.com/ManonLacombe/monstock/releases/latest/download/MonStock.apk"

VERT = (46, 125, 50, 255)
ORANGE = (239, 108, 0, 255)
GRIS = (107, 114, 128, 255)


def qr_brut(url: str, couleur=VERT) -> PilImage:
    """Un QR code carré, net, avec une marge blanche confortable."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=14,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    return recolorer(img, couleur)


def recolorer(img, couleur):
    """Teinte le QR sans écraser le blanc de fond (le contraste reste lisible)."""
    pixels = img.load()
    r, v, b, a = couleur
    for y in range(img.height):
        for x in range(img.width):
            pr, pv, pb = pixels[x, y]
            if pr < 128:                      # module sombre
                pixels[x, y] = (r, v, b)
    return img


def carte(qr, titre: str, url: str, accent) -> PilImage:
    """Habille le QR d'un titre, d'une URL et d'une bordure."""
    from PIL import Image, ImageDraw

    marge = 46
    bande_haut = 100
    bande_bas = 116
    largeur = max(qr.width, 520) + marge * 2
    hauteur = qr.height + marge * 2 + bande_haut + bande_bas

    canvas = Image.new("RGB", (largeur, hauteur), "white")
    d = ImageDraw.Draw(canvas)

    f_titre = _police(30, gras=True)
    f_url = _police(19)

    # bandeau de titre
    d.rectangle([0, 0, largeur, bande_haut], fill=accent)
    d.text((marge, 32), titre, fill="white", font=f_titre)

    canvas.paste(qr, ((largeur - qr.width) // 2, bande_haut + marge // 2))

    # URL en bas, repliée si besoin
    d.text((marge, hauteur - bande_bas + 26), "Scanner pour ouvrir",
           fill=GRIS, font=f_url)
    y = hauteur - bande_bas + 60
    for ligne in _repliquer(url, largeur - marge * 2):
        d.text((marge, y), ligne, fill=GRIS, font=f_url)
        y += 27

    return canvas


def _police(taille: int, gras: bool = False):
    """Police Unicode ; à défaut la police bitmap par défaut de Pillow."""
    from PIL import ImageFont

    noms = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf" % ("-Bold" if gras else ""),
        "/usr/share/fonts/truetype/liberation/LiberationSans%s.ttf"
        % ("-Bold" if gras else "-Regular"),
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    ]
    for nom in noms:
        if Path(nom).exists():
            try:
                return ImageFont.truetype(nom, taille)
            except OSError:
                continue
    return ImageFont.load_default()


def _repliquer(texte: str, largeur_max: int) -> list:
    """Coupe une URL trop longue en lignes d'environ 52 caractères."""
    if len(texte) <= 52:
        return [texte]
    morceaux, i = [], 0
    while i < len(texte):
        coupe = min(i + 52, len(texte))
        # évite de couper au milieu d'un segment d'URL
        while coupe < len(texte) and texte[coupe] not in "/?=&":
            coupe += 1
        morceaux.append(texte[i:coupe])
        i = coupe
    return morceaux


def main() -> None:
    p = argparse.ArgumentParser(description="Génère les QR codes MonStock")
    p.add_argument("--web", default=URL_WEB_DEF, help="URL de la version web")
    p.add_argument("--apk", default=URL_APK_DEF, help="URL de téléchargement de l'APK")
    args = p.parse_args()

    SORTIE.mkdir(parents=True, exist_ok=True)

    cibles = [
        ("qrcode-web.png", args.web, "MonStock — version web", VERT),
        ("qrcode-apk.png", args.apk, "MonStock — application Android", ORANGE),
    ]
    for nom, url, titre, accent in cibles:
        # Les modules du QR restent toujours vert foncé : l'orange du bandeau
        # n'a pas assez de contraste pour être décodé de façon fiable.
        img = carte(qr_brut(url, VERT), titre, url, accent)
        chemin = SORTIE / nom
        img.save(chemin, "PNG")
        print("%-18s %s" % (nom, chemin.relative_to(ROOT)))
        print("%-18s %s" % ("", url))

    # version PNG simple, sans habillage
    for nom, url in (("qr-web-simple.png", args.web), ("qr-apk-simple.png", args.apk)):
        chemin = SORTIE / nom
        qr_brut(url).save(chemin, "PNG")
        print("%-18s %s" % (nom, chemin.relative_to(ROOT)))


if __name__ == "__main__":
    main()