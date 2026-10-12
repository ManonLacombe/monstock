#!/usr/bin/env python3
"""Contrôle qualité des données MonStock.

Vérifie que :
  - les fichiers data/*.js sont du JSON valide une fois le préfixe retiré ;
  - chaque ingrédient de recette existe dans le catalogue ;
  - chaque recette est bien < 500 kcal par portion ;
  - les identifiants sont uniques et les références cohérentes.

Usage : python3 scripts/validate.py
Code de sortie : 0 si tout est OK, 1 sinon.
"""
import ast
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOODS_JS = ROOT / "web" / "data" / "foods.js"
RECIPES_JS = ROOT / "web" / "data" / "recipes.js"
MAX_KCAL = 500

# Caractères hors alphabet latin : le CJK coréen et les ponctutions
# asiatiques signalent quasi toujours un texte corrompu.
CARACTERES_ETRANGERS = re.compile(r"[\u3000-\u9fff\uff00-\uffef]")
# Fragments apparus dans des textes mal générés.
MOTS_SUSPECTS = re.compile(
    r"\b(?:Download|checked|wells|known|Small)\b|encoresonger|leDownload", re.IGNORECASE)


def verifier_texte(texte: str, ou: str, erreurs: list[str]) -> None:
    """Signale un texte corrompu (caractère étranger, mot parasite, séparateur)."""
    if not texte:
        return
    for c in set(CARACTERES_ETRANGERS.findall(texte)):
        erreurs.append("%s : caractère étranger %r" % (ou, c))
    if MOTS_SUSPECTS.search(texte):
        erreurs.append("%s : texte suspect -> %r" % (ou, texte))
    if "|" in texte:
        erreurs.append("%s : séparateur parasite -> %r" % (ou, texte))


def js_literal_to_python(source: str) -> str:
    """Convertit un littéral JS (clés sans guillemets, true/false/null) en littier Python.

    Les fichiers data/*.js n'utilisent que des littéraux : la conversion est donc
    sûre et permet de les contrôler avec la seule bibliothèque standard.
    """
    source = re.sub(r"/\*.*?\*/", "", source, flags=re.S)      # commentaires /* */
    source = re.sub(r"(?<![:'\"])//[^\n]*", "", source)       # commentaires //
    source = re.sub(r"([{,]\s*)([A-Za-z_$][\w$]*)\s*:", r'\1"\2":', source)  # clés nues
    source = re.sub(r"\btrue\b", "True", source)
    source = re.sub(r"\bfalse\b", "False", source)
    source = re.sub(r"\bnull\b", "None", source)
    source = re.sub(r",(\s*[}\]])", r"\1", source)             # virgules finales
    return source


def load_js_array(path: Path, var_name: str):
    """Extrait `window.VAR = [...]` et le convertit en structures Python."""
    raw = path.read_text(encoding="utf-8")
    match = re.search(r"window\.%s\s*=\s*" % re.escape(var_name), raw)
    if not match:
        raise ValueError("Variable window.%s introuvable dans %s" % (var_name, path))
    body = raw[match.end():].strip()
    if body.endswith(";"):
        body = body[:-1]
    return ast.literal_eval(js_literal_to_python(body))


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    # ------------------------------------------------------------ foods
    try:
        foods = load_js_array(FOODS_JS, "MS_FOODS")
    except Exception as exc:  # noqa: BLE001
        print("ERREUR foods.js illisible : %s" % exc)
        return 1

    by_id: dict[str, dict] = {}
    for food in foods:
        fid = food.get("id")
        if not fid:
            errors.append("Aliment sans id : %r" % food)
            continue
        if fid in by_id:
            errors.append("Identifiant d'aliment dupliqué : %s" % fid)
        by_id[fid] = food
        for key in ("name", "cat", "kcal", "fresh"):
            if key not in food:
                errors.append("Aliment %s : champ '%s' manquant" % (fid, key))
        verifier_texte(food.get("name", ""), "Aliment %s" % fid, errors)
        if not isinstance(food.get("kcal"), (int, float)):
            errors.append("Aliment %s : kcal non numérique" % fid)
        if food.get("fresh") and food.get("perish") is None:
            warnings.append("Aliment %s marqué frais mais sans durée de conservation" % fid)

    print("Aliments : %d" % len(by_id))

    # ------------------------------------------------------------ recipes
    try:
        recipes = load_js_array(RECIPES_JS, "MS_RECIPES")
    except Exception as exc:  # noqa: BLE001
        print("ERREUR recipes.js illisible : %s" % exc)
        return 1

    seen_recipe: set[str] = set()
    total_recipes = 0

    for recipe in recipes:
        rid = recipe.get("id")
        if not rid:
            errors.append("Recette sans id : %r" % recipe.get("name"))
            continue
        if rid in seen_recipe:
            errors.append("Identifiant de recette dupliqué : %s" % rid)
        seen_recipe.add(rid)

        servings = recipe.get("serv", 1)
        if not isinstance(servings, int) or servings < 1:
            errors.append("Recette %s : 'serv' doit être un entier >= 1" % rid)
            servings = 1

        ingredients = recipe.get("ing") or []
        if not ingredients:
            errors.append("Recette %s : aucun ingrédient" % rid)
            continue

        total_kcal = 0.0
        missing: list[str] = []
        for ingredient in ingredients:
            iid = ingredient.get("id")
            qty = ingredient.get("q")
            if iid not in by_id:
                missing.append(iid)
                continue
            if not isinstance(qty, (int, float)) or qty < 0:
                errors.append("Recette %s : quantité invalide pour %s (%r)" % (rid, iid, qty))
                continue
            total_kcal += by_id[iid]["kcal"] * qty / 100.0

        if missing:
            errors.append(
                "Recette %s : ingrédient(s) absent(s) du catalogue -> %s"
                % (rid, ", ".join(sorted(set(str(m) for m in missing))))
            )

        per_serving = total_kcal / servings
        status = "OK " if per_serving < MAX_KCAL else "HORS"
        if per_serving >= MAX_KCAL:
            errors.append(
                "Recette %s (%s) : %.0f kcal/portion, seuil < %d"
                % (rid, recipe.get("name"), per_serving, MAX_KCAL)
            )
        elif per_serving > MAX_KCAL * 0.92:
            warnings.append(
                "Recette %s : %.0f kcal/portion, proche du seuil" % (rid, per_serving)
            )
        total_recipes += 1

        verifier_texte(recipe.get("name", ""), "Recette %s (nom)" % rid, errors)
        verifier_texte(recipe.get("desc", ""), "Recette %s (desc)" % rid, errors)
        for n, etape in enumerate(recipe.get("steps") or [], 1):
            verifier_texte(etape, "Recette %s étape %d" % (rid, n), errors)

    print("Recettes : %d" % total_recipes)

    unused = sorted(set(by_id) - {
        i.get("id") for r in recipes for i in (r.get("ing") or [])
    })
    #（在 catalogue 中合理存在未被使用项）
    if unused:
        print("Aliments du catalogue non utilisés dans une recette : %d" % len(unused))

    print("-" * 60)
    for warning in warnings:
        print("AVERTISSEMENT : %s" % warning)
    for error in errors:
        print("ERREUR : %s" % error)

    if errors:
        print("-" * 60)
        print("%d erreur(s), %d avertissement(s)" % (len(errors), len(warnings)))
        return 1
    print("Tout est valide : %d recettes, toutes < %d kcal/portion." % (total_recipes, MAX_KCAL))
    return 0


if __name__ == "__main__":
    sys.exit(main())