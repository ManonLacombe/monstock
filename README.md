# 🧊 MonStock — garde-manger intelligent & recettes < 500 kcal

Application mobile qui note ce que tu as dans ton frigo et te propose des repas
**sous 500 kcal par portion**, en utilisant **en priorité ce qui va périmer**.

Deux versions, **un seul code** :
- **version web** (PWA) — installable depuis le navigateur ;
- **APK Android** — la même application, embarquée et fonctionnelle hors connexion.

---

## 📲 Les deux QR codes

| Version web | Application Android |
|---|---|
| ![QR web](qrcode-web.png) | ![QR APK](qrcode-apk.png) |
| <https://manonlacombe.github.io/monstock/> | [Release v1.0.0](https://github.com/ManonLacombe/monstock/releases/tag/v1.0.0) |

Code : <https://github.com/ManonLacombe/monstock>

### Installer la version web
Scanner le QR avec l'appareil photo. Sur mobile, menu du navigateur →
**Ajouter à l'écran d'accueil** : l'application s'installe et fonctionne hors ligne.

Le dossier `docs/` du dépôt est publié tel quel par GitHub Pages
(*Settings → Pages → Source : branche `main`, dossier `/docs`*).
Il n'y a **ni workflow, ni CI** : pousser une modification suffit, la version
web se met à jour automatiquement.

### Installer l'APK Android
1. Scanner le QR code « Android » avec l'appareil photo, puis ouvrir le fichier téléchargé.
2. Paramètres → Applications → **Accès aux applications spéciales** →
   *Installer des applications inconnues* → autoriser le navigateur utilisé.
3. Confirmer l'installation.
4. Au lancement, aucune permission n'est demandée : l'application est 100 % hors ligne.

---

## ✨ Ce que fait l'application

### 1. Mon stock
Tu notes chaque aliment avec sa **quantité** et sa **date de péremption**.
La liste est triée par urgence : les aliments périmés ou à consommer sous
3 jours remontent en haut, avec un bandeau d'alerte.
Pour un aliment frais, la date de péremption la plus probable est **proposée
automatiquement**.

### 2. Recettes — un repas, pas un plat
Un repas se compose d'**une entrée**, **d'un plat principal**, **d'un fromage**
et **d'un dessert**. Chaque poste est facultatif (`et/ou`), et c'est **le total**
qui doit tenir dans le budget d'environ **500 kcal** — pas chaque plat seul.

Un bouton **✨ Proposer un repas** assemble automatiquement une proposition
qui tient, en privilégiant ce qui va périmer. Après avoir retiré un ou
plusieurs choix, **🔄 Régénérer** repose une proposition complète :

| Poste | Ce qui est proposé |
|---|---|
| Entrée | salades, veloutés, soupes, œufs durs, tartine chèvre-miel… |
| Plat | 57 plats, du plus léger au plus rassasiant |
| Fromage | une portion de camembert, brie, comté, chèvre, bleu, mozzarella… |
| Dessert | yaourt-fruits, chocolat, compote, crème anglaise, flan… |

Une **jauge** montre en permanence le total et les calories restantes, et les
propositions de chaque poste sont **filtrées selon la place restante** : si
il ne reste que 15 kcal, plus rien n'est proposé.

87 plats au total, dont 14 pensés comme plats légers (250-320 kcal) pour
pouvoir composer un repas complet à quatre postes.

Le second onglet, **📋 Liste de plats**, donne accès à tous les plats
individuellement, avec les filtres habituels.

### 3. Ajouter un aliment

Deux chemins, selon ce que tu as sous la main :

**📷 Scanner un code-barres** — l'app interroge la base ouverte
[Open Food Facts](https://world.openfoodfacts.fr) et récupère le nom, les
calories et le magasin s'ils sont connus. Le poids du conditionnement est
proposé automatiquement (une barquette de 0,35 kg → 350 g).

Si le produit est **inconnu de la base**, l'app ne laisse pas un écran noir :
elle affiche le code scanné, explique pourquoi, et propose
**Ajouter à la main**. On peut aussi **saisir le code à la main** quand
l'emballage est abîmé.

**À la main** — la recherche couvre le catalogue de 227 aliments et les
produits que tu as déjà enregistrés. Si le nom n'existe pas,
**➕ Créer** permet d'ajouter l'aliment avec ses calories : il est gardé
pour les prochaines fois et devient utilisable dans tes recettes.

**En grammes ou à la pièce** — 33 aliments ont un poids unitaire connu.
Pour les œufs, les fruits et les légumes, tu peux saisir **3 pièces**
(3 × 50 g) au lieu de deviner en grammes ; l'app convertit et affiche
l'équivalence.

### 4. « J'ai mangé »
Pour tout ce qui ne vient pas d'une recette proposée — un morceau de pain,
une envie de dernière minute, un aperçu que tu as fini.

- **🍽 J'ai mangé** en haut de l'écran *Stock* : cherche l'aliment, indique
  les grammes, le stock diminue.
- Le même bouton existe sur **chaque ligne** de ton stock, avec la quantité
  déjà remplie.
- Les aliments que tu as réellement en stock remontent en premier dans la liste.
- Si l'aliment n'est pas dans ton stock, l'app ne simule rien : elle propose
  de l'ajouter d'abord, à la bonne quantité.

Restent dans le stock : `400 g → 250 g` après avoir mangé 150 g.
Consommer exactement tout retire proprement la ligne.

### 5. « Tu l'as oublié ? »
Quand une recette réclame un ingrédient que tu n'as pas noté, l'application
**te pose la question** au lieu de l'ignorer :

> 🤔 Il te manque 2 ingrédient(s). Tu les as peut-être oublié(s) ?

Pour chaque ingrédient manquant, trois réponses :

| Bouton | Effet |
|---|---|
| **😀 Je l'ai !** | ouvre la fiche de saisie (quantité + date) pour l'ajouter au stock |
| **🛒 À acheter** | l'ajoute à la liste de courses avec la quantité de la recette |
| **🚫 Ne pas utiliser** | la recette ne sera plus jamais proposée |

C'est la réponse au principal oubli : l'aliment était bien chez toi, mais pas
dans l'application.

### 6. 🧪 Une découverte par mois
Une fois par mois, l'application propose **un aliment que tu n'as jamais goûté**,
le place **dans un repas complet** (< 500 kcal) et l'ajoute à ta liste de courses.
Une fois le goût donné :

- 😋 **J'ai aimé** → classé dans tes goûts, et **un autre aliment est proposé
  immédiatement** (tu connais maintenant celui-là)
- 😖 **Je n'ai pas aimé** → exclu des propositions, et un autre est proposé
- 🤷 **Je ne sais pas** → **reproposé plus tard**, une seule fois ; s'il n'y a
  toujours pas d'avis, l'aliment sort définitivement du cycle

Seuls les aliments jamais notés et absents de ton stock sont proposés : on
ne te rebAPTise pas un aliment que tu connais déjà.

### 7. 💚 Mes goûts
La liste de tous les aliments notés : **aimés**, **pas aimés**, **à retester**,
**à éviter**. Chaque entrée se corrige ou se supprime en un geste.
Les aliments que tu n'aimes pas sont **exclus** de toutes les recettes.

### 8. 🛒 Liste de courses
 Alimentes automatiquement :
- les ingrédients manquants des recettes que tu ouvres ;
- l'aliment à goûter du mois.

### 9. ⚙️ Réglages
Plafond de calories (200–900), fréquence de la découverte (défaut **30 jours**),
**export / import** d'une sauvegarde JSON, et effacement complet.

---

## 🔐 Données et vie privée

**Tes données restent sur ton appareil.** Stock, goûts, courses et
recettes sont stockés **uniquement** dans le `localStorage` du navigateur ou
de l'APK. Tu peux exporter ta sauvegarde en un fichier JSON à tout moment.

L'application a **deux sorties réseau**, toutes deux sur demande explicite :

| Fonction | Ce qui sort de l'appareil | Pourquoi |
|---|---|---|
| 📷 **Scan d'un code-barres** | le code-barres scanné | interroge la base ouverte [Open Food Facts](https://world.openfoodfacts.fr) pour récupérer nom, calories et magasin |
| — saisie manuelle du code | le numéro saisi | même appel, quand le code-barres est illisible |
| — rien d'autre | — | aucune statistics, aucun compte, aucun envoi automatique |

La base Open Food Facts est un projet libre : elle ne reçoit **ni ton nom,
ni tes autres données** — seulement le numéro que tu scannes.

> **Pourquoi pas de recherche par nom ?** Les endpoints de recherche d'Open
> Food Facts n'envoient pas d'en-tête CORS et renvoient des erreurs 503 : ils
> sont inaccessibles depuis un navigateur. La lecture d'un produit par
> code-barres, elle, fonctionne. Le catalogue intégré (226 aliments français)
> couvre le quotidien hors ligne.

### Permissions Android

| Permission | Usage | Refusable ? |
|---|---|---|
| `INTERNET` | uniquement le scan de code-barres | non (demandée à l'installation) |
| `CAMERA` | uniquement le scan de code-barres | **oui**, tout le reste fonctionne sans |

Aucune donnée de localisation, de contacts ou de stockage n'est demandée.

---

## 📁 Structure du dépôt

```
docs/                     ← site web publié par GitHub Pages
  index.html              structure de l'application
  styles.css              design mobile-first
  app.js                  logique applicative (stock, recettes, découverte…)
  manifest.webmanifest    configuration PWA
  sw.js                   service worker (hors ligne + mises à jour)
  data/
    foods.js              catalogue de 129 aliments (kcal/100 g, fraîcheur)
    recipes.js            87 plats (entrée / plat / fromage / dessert)
  icons/                  icônes de l'application
  qrcode-web.png          QR de la version web
  qrcode-apk.png          QR de l'application Android

android/                  ← coquille WebView autour de docs/
  app/src/main/
    java/…/MainActivity.java
    assets/web/           copie de docs/ générée à la compilation
  app/build.gradle.kts    signature + tâche de synchronisation des assets

scripts/
  validate.py             contrôle qualité des données (voir plus bas)
  gen_icons.py            génère toutes les icônes
  gen_qr.py               génère les QR codes
  build.sh                construit l'APK et régénère les QR

docs/                     QR codes
```

---

## 🛠️ Développement

### Contrôler les données avant de pousser
```bash
python3 scripts/validate.py
```
Vérifie que : les fichiers de données sont lisibles, que chaque ingrédient
existe dans le catalogue, que **chaque plat tient seul dans le budget**, que
**les quatre formes de repas restent constructibles sous 500 kcal**, que les
identifiants sont uniques et que les textes ne contiennent aucun caractère
corrompu.

```
Tout est valide : 87 plats, chaque composant tient dans le budget de 500 kcal.
```

### Regenerer les icônes et les QR codes
```bash
python3 scripts/gen_icons.py
python3 scripts/gen_qr.py
```

### Construire l'APK
```bash
./scripts/build.sh
```
Prérequis : un SDK Android (`android/local.properties`) et un JDK.
L'APK signé est produit dans
`android/app/build/outputs/apk/release/app-release.apk`.

### Modifier le catalogue ou les recettes
`docs/data/foods.js` et `docs/data/recipes.js` sont des tableaux JavaScript.
Après modification, **relancer `validate.py`**, puis :

```bash
./scripts/build.sh          # reconstruit l'APK
git push                    # met à jour la version web
```

---

## ⚠️ Avertissement

Les valeurs nutritionnelles sont des **approximations** issues de tables
génériques (type CIQUAL) et peuvent varier selon la variété et la préparation.
Cette application est un outil d'organisation, pas un avis médical.
En cas de besoin particulier (allergie, régime spécifique, grossesse), demande
l'avis d'un professionnel de santé ou d'un diététicien.