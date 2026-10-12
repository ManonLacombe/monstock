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
| ![QR web](docs/qrcode-web.png) | ![QR APK](docs/qrcode-apk.png) |
| <https://manonlacombe.github.io/monstock/> | APK signé, à installer depuis le téléphone |

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

### 2. Recettes — le cœur de l'app
50 recettes, toutes **sous 500 kcal par portion**, classées selon :

| Critère | Effet |
|---|---|
| Ingrédient **frais qui périme sous 3 jours** | forte priorité (« 🥕 sauve 2 ») |
| Ingrédient que tu as déjà en stock | priorité |
| Ingrédient qui manque | malus léger |
| Ingrédient que tu **n'aimes pas** | recette **exclue** |
| Ingrédient que tu **aimais** | petit bonus |

Filtres : *Toutes*, *Sans manque*, *À sauver*, *Tu aimes ça*.

### 3. « Tu l'as oublié ? »
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

### 4. 🧪 Une découverte par mois
Une fois par mois, l'application propose **un aliment que tu n'as jamais goûté**,
le place **dans un repas complet** (< 500 kcal) et l'ajoute à ta liste de courses.
Une fois le goût donné :

- 😋 **J'ai aimé** → classé dans tes goûts
- 😖 **Je n'ai pas aimé** → exclu des propositions
- 🤷 **Je ne sais pas** → **reproposé une fois** au mois suivant ;
  s'il n'y a toujours pas d'avis, l'aliment sort du cycle.

### 5. 💚 Mes goûts
La liste de tous les aliments notés : **aimés**, **pas aimés**, **à retester**,
**à éviter**. Chaque entrée se corrige ou se supprime en un geste.
Les aliments que tu n'aimes pas sont **exclus** de toutes les recettes.

### 6. 🛒 Liste de courses
 Alimentes automatiquement :
- les ingrédients manquants des recettes que tu ouvres ;
- l'aliment à goûter du mois.

### 7. ⚙️ Réglages
Plafond de calories (200–900), fréquence de la découverte (défaut **30 jours**),
**export / import** d'une sauvegarde JSON, et effacement complet.

---

## 🔐 Données et vie privée

Toutes les données (stock, goûts, courses) sont stockées **uniquement sur ton
appareil**, dans le `localStorage` du navigateur ou de l'APK.
**Rien n'est envoyé sur un serveur**, l'application n'a **aucune permission réseau**.
Tu peux exporter ta sauvegarde en un fichier JSON à tout moment.

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
    recipes.js            50 recettes < 500 kcal
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
existe dans le catalogue, que **toutes les recettes sont sous 500 kcal par
portion**, que les identifiants sont uniques et que les textes ne contiennent
pas de caractère corrompu.

```
Tout est valide : 50 recettes, toutes < 500 kcal/portion.
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