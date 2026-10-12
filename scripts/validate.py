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
FOODS_JS = ROOT / "docs" / "data" / "foods.js"
RECIPES_JS = ROOT / "docs" / "data" / "recipes.js"
MAX_KCAL = 500

# Un repas = une entrée + un plat + (un fromage) + (un dessert).
# C'est le TOTAL qui doit tenir dans le budget, plus chaque plat pris seul.
# On contrôle donc chaque composant, puis une composition complète typique.
PLATS_COMPLETS = [
    ("plat seul + fromage + dessert", ["plat", "fromage", "dessert"]),
    ("entrée + plat", ["entree", "plat"]),
    ("plat + dessert", ["plat", "dessert"]),
    ("repas complet", ["entree", "plat", "fromage", "dessert"]),
]

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
    par_type: dict[str, list] = {}

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
        typ = recipe.get("meal") or "plat"
        par_type.setdefault(typ, []).append((rid, recipe.get("name"), per_serving))

        # Chaque composant doit pouvoir tenir seul dans le budget :
        # au-delà, il ne rentrera jamais dans un repas.
        if per_serving > MAX_KCAL:
            errors.append(
                "%s : %s (%s) : %.0f kcal, trop lourd pour un composant de repas (max %d)"
                % (rid, typ, recipe.get("name"), per_serving, MAX_KCAL)
            )
        elif per_serving > MAX_KCAL * 0.9:
            warnings.append(
                "%s : %.0f kcal, peu de place pour le reste du repas" % (rid, per_serving)
            )
        total_recipes += 1

        verifier_texte(recipe.get("name", ""), "Recette %s (nom)" % rid, errors)
        verifier_texte(recipe.get("desc", ""), "Recette %s (desc)" % rid, errors)
        for n, etape in enumerate(recipe.get("steps") or [], 1):
            verifier_texte(etape, "Recette %s étape %d" % (rid, n), errors)

    print("Recettes : %d" % total_recipes)

    # --- contrôle de la composition des repas
    print("-" * 60)
    for typ in ("entree", "plat", "fromage", "dessert"):
        n = len(par_type.get(typ, []))
        if not n:
            errors.append("Aucun plat de type « %s » : le repas ne peut pas être composé" % typ)
            continue
        fourchettes = sorted(v for _, _, v in par_type[typ])
        print("  %-8s %2d plats | de %.0f à %.0f kcal"
              % (typ, n, fourchettes[0], fourchettes[-1]))

    # Un repas doit rester constructible dans le budget : pour chaque forme
    # de repas, on additionne les composants les plus légers de chaque poste.
    for libelle, types in PLATS_COMPLETS:
        if any(not par_type.get(t) for t in types):
            manquants = [t for t in types if not par_type.get(t)]
            errors.append("Composition « %s » : aucun plat de type %s"
                          % (libelle, ", ".join(manquants)))
            continue
        legs = []
        for typ in types:
            # le plus léger disponible pour ce poste
            legs.append(sorted(v for _, _, v in par_type[typ])[0])
        total = sum(legs)
        if total > MAX_KCAL:
            errors.append(
                "Composition « %s » : même la plus légère possible (%s) fait %.0f kcal, "
                "au-dessus de %d" % (libelle, " + ".join("%.0f" % v for v in legs),
                                     total, MAX_KCAL)
            )
        else:
            print("  %-26s à partir de %.0f kcal" % (libelle, total))

    unused = sorted(set(by_id) - {
        i.get("id") for r in recipes for i in (r.get("ing") or [])
    })
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
    print("-" * 60)
    print("Tout est valide : %d plats, chaque composant tient dans le budget de %d kcal."
          % (total_recipes, MAX_KCAL))
    return 0


if __name__ == "__main__":
    sys.exit(main())