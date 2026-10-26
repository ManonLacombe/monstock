/* ==========================================================================
   MonStock — logique applicative
   Données 100 % locales (localStorage). Aucune donnée envoyée sur le réseau.
   ========================================================================== */
(function () {
  'use strict';

  var CLE = 'monstock.v1';

  /* ------------------------------------------------------------------ utils */

  function el(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function aujourdhui() { return versISO(new Date()); }

  function versISO(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function depuisISO(iso) {
    var p = String(iso).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  /** Nombre de jours entiers entre aujourd'hui et une date (négatif = passé). */
  function joursRestants(iso) {
    if (!iso) return null;
    var a = depuisISO(aujourdhui());
    var b = depuisISO(iso);
    return Math.round((b - a) / 86400000);
  }

  function formaterDate(iso) {
    if (!iso) return '';
    var d = depuisISO(iso);
    return d.getDate() + ' ' + ['janv', 'févr', 'mars', 'avr', 'mai', 'juin',
      'juil', 'août', 'sept', 'oct', 'nov', 'déc'][d.getMonth()];
  }

  /** « 12 », « 1,5 », « 0,25 » */
  function fmtQte(n) {
    if (n == null) return '';
    if (n >= 100) return String(Math.round(n));
    if (Number.isInteger(n)) return String(n);
    return String(Math.round(n * 100) / 100).replace('.', ',');
  }

  function uid(p) {
    return p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  }

  /* ------------------------------------------------------------- catalogue */

  var CATALOGUE = window.MS_FOODS || [];
  var RECETTES = window.MS_RECIPES || [];
  var PAR_ID = {};
  CATALOGUE.forEach(function (a) { PAR_ID[a.id] = a; });

  var NOMS_CAT = {
    fruits: 'Fruits', legumes: 'Légumes', proteines: 'Protéines',
    legumineuses: 'Légumineuses', cereales: 'Céréales', laitages: 'Produits laitiers',
    condiments: 'Condiments', sucrants: 'Sucrants', boissons: 'Boissons'
  };

  /**
   * Résout un aliment, qu'il vienne du catalogue intégré
   * ou d'un produit trouvé en ligne et enregistré par l'utilisateur.
   */
  function aliment(id) {
    return PAR_ID[id] || (etat.produits && etat.produits[id]) || null;
  }
  function nomAliment(id) { var a = aliment(id); return a ? a.name : id; }

  /* ----------------------------------------------------------------- état */

  function etatVierge() {
    return {
      version: 1,
      stock: [],
      prefs: {},           // foodId -> { statut, at, nbTests }
      courses: [],
      produits: {},        // produits trouvés en ligne (Open Food Facts)
      recettes: [],        // recettes écrites par l'utilisateur
      repas: {},           // composition en cours (type -> id de plat)
      decouverte: { derniere: null, courante: null, historique: [] },
      reglages: { kcalMax: 500, intervalleJours: 30 }
    };
  }

  var etat = etatVierge();

  function charger() {
    try {
      var brut = localStorage.getItem(CLE);
      if (!brut) return;
      var d = JSON.parse(brut);
      etat = fusionner(etatVierge(), d);
    } catch (e) {
      console.warn('Stockage illisible, réinitialisation.', e);
    }
  }

  function fusionner(base, d) {
    if (!d || typeof d !== 'object') return base;
    ['stock', 'courses'].forEach(function (k) {
      if (Array.isArray(d[k])) base[k] = d[k];
    });
    if (d.prefs && typeof d.prefs === 'object') base.prefs = d.prefs;
    if (d.produits && typeof d.produits === 'object') base.produits = d.produits;
    if (Array.isArray(d.recettes)) base.recettes = d.recettes;
    if (d.repas && typeof d.repas === 'object') base.repas = d.repas;
    if (d.decouverte && typeof d.decouverte === 'object') {
      base.decouverte.derniere = d.decouverte.derniere || null;
      base.decouverte.courante = d.decouverte.courante || null;
      base.decouverte.historique = Array.isArray(d.decouverte.historique)
        ? d.decouverte.historique : [];
    }
    if (d.reglages && typeof d.reglages === 'object') {
      base.reglages.kcalMax = Number(d.reglages.kcalMax) || 500;
      base.reglages.intervalleJours = Number(d.reglages.intervalleJours) || 30;
    }
    return base;
  }

  function sauver() {
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch (e) {
      toast('Sauvegarde impossible (stockage plein ?)');
    }
  }

  /* ---------------------------------------------------------------- toast */

  var toastTimer = null;
  function toast(msg) {
    var t = el('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* --------------------------------------------------------------- modale */

  var modaleOuverte = null;

  function ouvrirModale(titre, html) {
    el('modal-title').textContent = titre;
    el('modal-body').innerHTML = html;
    el('modal-backdrop').hidden = false;
    modaleOuverte = true;
  }

  function fermerModale() {
    arreterCamera();          // ne jamais laisser la caméra allumée
    el('modal-backdrop').hidden = true;
    el('modal-body').innerHTML = '';
    modaleOuverte = null;
  }

  /* ================================================================ STOCK */

  /** Tri par urgence : périmé, puis le plus proche, puis sans date. */
  function stockTrie() {
    return etat.stock.slice().sort(function (a, b) {
      var ja = joursRestants(a.expiry), jb = joursRestants(b.expiry);
      if (ja === null && jb === null) return a.addedAt < b.addedAt ? 1 : -1;
      if (ja === null) return 1;
      if (jb === null) return -1;
      if (ja !== jb) return ja - jb;
      return a.addedAt < b.addedAt ? 1 : -1;
    });
  }

  function totalStock() {
    var parId = {};
    etat.stock.forEach(function (l) {
      parId[l.foodId] = (parId[l.foodId] || 0) + (Number(l.qty) || 0);
    });
    return parId;
  }

  function puceUrgence(expiry) {
    var j = joursRestants(expiry);
    if (j === null) return '<span class="puce puce-neutre">sans date</span>';
    if (j < 0) return '<span class="puce puce-expire">Périmé (' + Math.abs(j) + ' j)</span>';
    if (j === 0) return '<span class="puce puce-expire">À consommer aujourd’hui</span>';
    if (j <= 3) return '<span class="puce puce-bientot">J-' + j + '</span>';
    if (j <= 7) return '<span class="puce puce-bientot">Dans ' + j + ' jours</span>';
    return '<span class="puce puce-ok">' + formaterDate(expiry) + '</span>';
  }

  function rendreStock() {
    var liste = stockTrie();
    var ens = el('stock-list');

    // Banderoles d'alerte
    var perimes = liste.filter(function (l) { var j = joursRestants(l.expiry); return j !== null && j < 0; }).length;
    var urgents = liste.filter(function (l) { var j = joursRestants(l.expiry); return j !== null && j >= 0 && j <= 2; }).length;
    var b = '';
    if (perimes > 0) b += '<div class="banner alerte">⚠️ <strong>' + perimes +
      '</strong> aliment(s) périmé(s). Tu peux encore songer à les jeter.</div>';
    if (urgents > 0) b += '<div class="banner attention">⏳ <strong>' + urgents +
      '</strong> aliment(s) à consommer dans les 3 jours.</div>';
    if (liste.length === 0) b += '<div class="banner ok">Ton frigo est vide. Ajoute tes premiers aliments pour recevoir des recettes.</div>';
    el('stock-banner').innerHTML = b;

    if (liste.length === 0) {
      ens.innerHTML = '<div class="vide"><span class="grand">🧊</span>Aucun aliment en stock.<br>Ajoute ce que tu as chez toi.</div>';
      return;
    }

    ens.innerHTML = liste.map(function (l) {
      var a = aliment(l.foodId);
      var urgent = joursRestants(l.expiry);
      var accent = (urgent !== null && urgent <= 2) ? ' style="border-left:4px solid ' +
        (urgent < 0 ? 'var(--rouge)' : 'var(--orange)') + '"' : '';
      return '<div class="carte"' + accent + '>' +
        '<div class="ligne">' +
          '<div class="croissance">' +
            '<strong>' + esc(a ? a.name : l.foodId) + '</strong>' +
            '<span style="font-size:.82rem;color:var(--gris)">' +
            fmtQuantite(a, l.qty, a ? a.unit : 'g') + ' · ajouté le ' +
            formaterDate(l.addedAt) + '</span>' +
          '</div>' +
          '<div style="text-align:right">' + puceUrgence(l.expiry) + '</div>' +
        '</div>' +
        '<div class="actions-manquant">' +
          '<button class="btn btn-accent" data-act="manger" data-sid="' + l.sid + '">🍽 J’ai mangé</button>' +
          '<button class="btn btn-ghost" data-act="ajuster" data-sid="' + l.sid + '">Modifier</button>' +
          '<button class="btn btn-danger" data-act="retirer" data-sid="' + l.sid + '">Retirer</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function ajouterAuStock(foodId, qte, expiry) {
    etat.stock.push({
      sid: uid('s'), foodId: foodId, qty: Number(qte) || 0,
      expiry: expiry || null, addedAt: aujourdhui()
    });
    sauver();
  }

  /* ----------------------------------------------- modale ajout / édition */

  var foodChoisi = null;

  function modaleAjoutAliment(existant) {
    foodChoisi = existant ? existant.foodId : null;
    var f = foodChoisi ? aliment(foodChoisi) : null;
    var titre = existant ? 'Modifier l’aliment' : 'Ajouter un aliment';
    var valeurQte = existant ? existant.qty : '';
    var valeurExp = existant ? (existant.expiry || '') : '';

    ouvrirModale(titre,
      '<div class="champ">' +
        '<label for="m-recherche">Aliment</label>' +
        '<input id="m-recherche" type="search" placeholder="Rechercher dans le catalogue…" autocomplete="off">' +
        '<div class="suggestions" id="m-suggestions"></div>' +
        '<button class="btn btn-accent btn-block" id="m-scanner" style="margin-top:10px">' +
          '📷 Scanner un code-barres</button>' +
        '<div class="aide">Le scan interroge la base ouverte Open Food Facts : ' +
          'nom, calories et magasin s’ils sont connus. Rien d’autre n’est transmis.</div>' +
      '</div>' +
      '<div id="m-choisi"></div>' +
      '<div id="m-champs" ' + (f ? '' : 'hidden') + '>' +
        '<div class="champ">' +
          '<div class="champ-unite"><label for="m-qte">Quantité</label>' +
            '<div class="bascule" id="m-bascule" hidden>' +
              '<button type="button" class="on" data-u="g">grammes</button>' +
              '<button type="button" data-u="piece">pièces</button>' +
            '</div></div>' +
          '<input id="m-qte" type="number" inputmode="decimal" min="0" step="1" value="' + valeurQte + '">' +
          '<div class="aide" id="m-aide-qte"></div>' +
        '</div>' +
        '<div class="champ">' +
          '<label for="m-exp">Date de péremption</label>' +
          '<input id="m-exp" type="date" value="' + valeurExp + '">' +
          '<div class="aide">Laissez vide si l’aliment ne périme pas (sel, sucre…). ' +
          'Pour un aliment frais, la date la plus probable est proposée toute seule.</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-block" id="m-valider">' +
          (existant ? 'Enregistrer' : 'Ajouter au stock') + '</button>' +
      '</div>');

    var champRecherche = el('m-recherche');
    if (f) champRecherche.value = f.name;

    afficherChoisi();

    champRecherche.addEventListener('input', function () {
      foodChoisi = null;
      el('m-champs').hidden = true;
      el('m-choisi').innerHTML = '';
      rendreSuggestions(champRecherche.value);
    });

    rendreSuggestions('');
    el('m-scanner').addEventListener('click', function () {
      scannerCodeBarres(function (p) {
        if (p) produitScanne(p);
        else modaleAjoutAliment(null);   // produit inconnu : saisie manuelle
      });
    });
    el('m-bascule').querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = foodChoisi ? aliment(foodChoisi) : null;
        if (!a || !a.piece) return;
        var versPieces = b.getAttribute('data-u') === 'piece';
        if ((versPieces && uniteCourante === 'piece') || (!versPieces && uniteCourante === 'g')) return;
        basculerUnite(el('m-qte'), a, versPieces);
        uniteCourante = versPieces ? 'piece' : 'g';
        afficherChoisi();
      });
    });
    el('m-qte').addEventListener('input', function () { afficherChoisi(); });
    el('m-valider').addEventListener('click', function () { validerAjout(existant); });
  }

  /* --------------------------------------------------------------------
   * Suggestions : uniquement le catalogue intégré et les produits déjà
   * enregistrés. Aucun appel réseau ici — la base en ligne n'est
   * consultée que par scan volontaire d'un code-barres.
   * ------------------------------------------------------------------ */
  function rendreSuggestions(terme) {
    var t = String(terme || '').trim().toLowerCase();

    var locaux = CATALOGUE.concat(
      Object.keys(etat.produits || {}).map(function (k) { return etat.produits[k]; })
    ).filter(function (a) {
      if (!t) return true;
      return a.name.toLowerCase().indexOf(t) >= 0 ||
        (a.marque || '').toLowerCase().indexOf(t) >= 0 ||
        (NOMS_CAT[a.cat] || '').toLowerCase().indexOf(t) >= 0;
    }).slice(0, 60);

    var html = locaux.map(function (a) {
      return '<div class="suggestion" data-food="' + a.id + '">' +
        '<span>' + esc(a.name) + (a.magasin ? ' <span class="puce puce-neutre">' +
          esc(a.magasin) + '</span>' : '') + '</span>' +
        '<span class="kcal-mini">' + (a.kcal || '?') + ' kcal/100' + esc(a.unit) + '</span>' +
      '</div>';
    }).join('');

    // Rien trouvé : on propose de créer l'aliment à la main, avec ses calories.
    if (t.length >= 3) {
      html += '<div class="suggestion suggestion-creer" data-creer="1">' +
        '<span>➕ Créer « ' + esc(String(terme).trim()) + ' »</span>' +
        '<span class="kcal-mini">nouveau</span></div>';
    }
    if (!html) {
      html = '<div class="suggestion" style="color:var(--gris)">' +
        'Aucun aliment de ce nom dans le catalogue.</div>';
    }
    el('m-suggestions').innerHTML = html;

    Array.prototype.forEach.call(el('m-suggestions').querySelectorAll('[data-food]'), function (n) {
      n.addEventListener('click', function () { choisir(n.getAttribute('data-food')); });
    });
    var cr = el('m-suggestions').querySelector('[data-creer]');
    if (cr) cr.addEventListener('click', function () { creerAliment(String(terme).trim()); });
  }

  /** Crée un aliment absent du catalogue (produit scanné inconnu, plat maison…). */
  function creerAliment(nom) {
    if (!nom) return;
    ouvrirModale('Nouvel aliment',
      '<div class="champ"><label>Nom</label>' +
        '<input id="nc-nom" type="text" value="' + esc(nom) + '"></div>' +
      '<div class="champ"><label for="nc-kcal">Calories pour 100 g</label>' +
        '<input id="nc-kcal" type="number" inputmode="decimal" min="0" step="1" placeholder="Ex. 250"></div>' +
      '<div class="aide">Regarde l’étiquette du produit. Tu pourras corriger ' +
        'cette valeur plus tard si besoin.</div>' +
      '<div style="margin-top:14px">' +
        '<button class="btn btn-primary btn-block" id="nc-valider">Créer et l’ajouter au stock</button></div>');

    el('nc-valider').addEventListener('click', function () {
      var n = el('nc-nom').value.trim();
      var k = Math.max(0, Number(el('nc-kcal').value) || 0);
      if (!n) { toast('Indique un nom'); return; }

      var id = 'perso_' + n.toLowerCase()
        .normalize ? 'perso_' + n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '_').slice(0, 40)
        : 'perso_' + n.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
      // suffixe si le nom existe déjà avec d'autres calories
      var base = id, n2 = 2;
      while (etat.produits[id] && etat.produits[id].name.toLowerCase() === n.toLowerCase()
             && etat.produits[id].kcal !== k) { id = base + '_' + n2; n2++; }

      etat.produits[id] = {
        id: id, name: n, cat: 'condiments', kcal: k, unit: 'g',
        fresh: false, perish: null, perso: true
      };
      sauver();
      ouvrirModaleAjoutAvecQuantite(id, 100);
      toast('« ' + n + ' » ajouté au catalogue local');
    });
  }

  function choisir(id) {
    foodChoisi = id;
    uniteCourante = 'g';          // on saisit toujours en grammes au départ
    el('m-recherche').value = nomAliment(id);
    el('m-suggestions').innerHTML = '';
    el('m-champs').hidden = false;
    afficherChoisi();
    proposerDate();
  }

  /** Récupère un produit scanné et le place dans la fiche d'ajout. */
  function produitScanne(p) {
    enregistrerProduit(p);
    // Le scanner avait remplacé la fiche d'ajout par son propre écran :
    // il faut la rouvrir, sinon l'utilisateur n'a plus rien à remplir.
    var poids = null;
    var m = p.conditionnement && String(p.conditionnement)
      .replace(',', '.').match(/([\d]+(?:[.,]\d+)?)\s*(kg|g)\b/i);
    if (m) {
      var n = parseFloat(String(m[1]).replace(',', '.'));
      poids = Math.round(m[2].toLowerCase() === 'kg' ? n * 1000 : n);
    }
    ouvrirModaleAjoutAvecQuantite(p.id, poids || 100);
    toast(p.name + ' — vérifie la quantité et valide');
  }

  function afficherChoisi() {
    var a = foodChoisi ? aliment(foodChoisi) : null;
    if (!a) { el('m-choisi').innerHTML = ''; return; }
    var details = [];
    if (a.marque) details.push(esc(a.marque));
    if (a.magasin) details.push('vendu chez <strong>' + esc(a.magasin) + '</strong>');
    if (a.conditionnement) details.push(esc(a.conditionnement));
    el('m-choisi').innerHTML = '<div class="carte" style="padding:10px;margin:10px 0 0;box-shadow:none;background:var(--vert-clair)">' +
      '<strong>' + esc(a.name) + '</strong> — ' + a.kcal + ' kcal/100' + esc(a.unit) +
      (a.fresh ? ' · <span class="puce puce-ok">frais</span>' : '') +
      (details.length ? '<div style="font-size:.82rem;color:var(--gris);margin-top:3px">' +
        details.join(' · ') + '</div>' : '') + '</div>';

    // Bascule grammes ↔ pièces quand l'aliment se compte à l'unité
    var bascule = el('m-bascule');
    var aide = el('m-aide-qte');
    var p = poidsUnite(foodChoisi);
    if (bascule) {
      bascule.hidden = !p;
      if (p) {
        bascule.querySelectorAll('button').forEach(function (b) {
          b.classList.toggle('on', b.getAttribute('data-u') === (uniteCourante === 'piece' ? 'piece' : 'g'));
        });
      }
    }
    if (aide) {
      var enP = uniteCourante === 'piece';
      if (p) {
        aide.textContent = enP
          ? '1 ' + p.label + ' = ' + p.g + ' g'
          : 'Soit environ ' + (enPieces(a, Number(el('m-qte').value) || 0) || 0) + ' ' + p.label + '(s)';
      } else {
        aide.textContent = 'En ' + (a.unit === 'ml' ? 'millilitres' : 'grammes') + '.';
      }
    }
  }

  var uniteCourante = 'g';

  /** Propose la date de péremption la plus vraisemblable pour un aliment frais. */
  function proposerDate() {
    var a = foodChoisi ? aliment(foodChoisi) : null;
    if (!a) return;
    var champ = el('m-exp');
    if (!champ || champ.value) return;
    if (a.fresh && a.perish) {
      var d = new Date();
      d.setDate(d.getDate() + a.perish);
      champ.value = versISO(d);
    }
  }

  function validerAjout(existant) {
    if (!foodChoisi) { toast('Choisis d’abord un aliment'); return; }
    var a = aliment(foodChoisi);
    var saisie = Number(el('m-qte').value);
    var qte = Math.round(enGrammes(a, saisie, uniteCourante === 'piece'));
    if (!qte || qte <= 0) { toast('Indique une quantité'); return; }
    var exp = el('m-exp').value || null;

    if (existant) {
      existant.qty = qte;
      existant.expiry = exp;
      sauver();
      toast('Aliment mis à jour');
    } else {
      ajouterAuStock(foodChoisi, qte, exp);
      toast(nomAliment(foodChoisi) + ' ajouté');
    }
    fermerModale();
    rafraichir();
  }

  /* ========================================== COMPOSEUR DE REPAS */

  /* Un repas = une entrée, un plat, (un fromage), (un dessert).
   * C'est le TOTAL qui doit tenir dans le budget (~500 kcal).
   * Chaque poste est facultatif : on ne garde que ce qui tient. */

  var ORDRES_REPAS = ['entree', 'plat', 'fromage', 'dessert'];
  var LIBELLE_REPAS = {
    entree: 'Entrée', plat: 'Plat principal',
    fromage: 'Fromage', dessert: 'Dessert'
  };

  var composition = {};     // type -> id du plat retenu (vide = non choisi)

  function chargerComposition() {
    composition = (etat.repas && typeof etat.repas === 'object') ? etat.repas : {};
  }

  function platsDeType(type) {
    return toutesRecettes().filter(function (r) {
      return (r.meal || 'plat') === type;
    }).map(function (r) { return analyserRecette(r); })
      .filter(function (a) { return !a.exclue; });
  }

  function platChoisi(type) {
    var id = composition[type];
    if (!id) return null;
    return toutesRecettes().filter(function (r) { return r.id === id; })[0] || null;
  }

  function kcalRepas() {
    var total = 0;
    ORDRES_REPAS.forEach(function (t) {
      var r = platChoisi(t);
      if (r) total += kcalParPortion(r);
    });
    return Math.round(total);
  }

  /** Place les plats les plus prioritaires (péremption) sans dépasser le budget. */
  function propositionsRepas() {
    var budget = etat.reglages.kcalMax;
    var parType = {};
    ORDRES_REPAS.forEach(function (t) {
      parType[t] = platsDeType(t).sort(function (a, b) { return b.score - a.score; });
    });

    // On part du plat principal, puis on complète tant qu'il reste de la place.
    var choix = {};
    var reste = budget;
    ['plat', 'entree', 'fromage', 'dessert'].forEach(function (type) {
      var pool = parType[type];
      var meilleur = null;
      for (var i = 0; i < pool.length; i++) {
        if (pool[i].kcal <= reste) { meilleur = pool[i]; break; }
      }
      if (meilleur) { choix[type] = meilleur.recette.id; reste -= meilleur.kcal; }
    });
    return choix;
  }

  function rendreCompositeur() {
    var zone = el('composer-repas');
    if (!zone) return;
    if (modeRecettes !== 'repas') { zone.hidden = true; return; }
    zone.hidden = false;

    var total = kcalRepas();
    var budget = etat.reglages.kcalMax;
    var reste = budget - total;
    var pct = Math.max(0, Math.min(100, Math.round((total / budget) * 100)));
    var etatClasse = total === 0 ? '' : (total <= budget ? 'ok' : 'alerte');

    var html = '<div class="budget' + (etatClasse ? ' budget-' + etatClasse : '') + '">' +
      '<div class="ligne"><strong>' + total + ' kcal</strong>' +
        '<span style="color:var(--gris);font-size:.85rem">sur ' + budget + ' kcal</span>' +
        (reste > 0 && total > 0
          ? '<span style="flex:1;text-align:right;font-size:.85rem;color:var(--gris)">' +
            reste + ' kcal restantes</span>' : '') +
      '</div>' +
      '<div class="jauge"><div class="jauge-remplie" style="width:' + pct + '%"></div></div>' +
      (total === 0 ? '<p style="margin:10px 0 0;font-size:.86rem;color:var(--gris)">' +
        'Compose ton repas : entrée, plat, fromage, dessert. Le total doit rester ' +
        'sous ' + budget + ' kcal.</p>' : '') +
    '</div>';

    html += '<div class="actions-manquant" style="margin-bottom:12px">' +
      '<button class="btn btn-primary" id="btn-proposer-repas">' +
        '✨ Proposer un repas</button>' +
      '<button class="btn btn-ghost" id="btn-regen-repas">🔄 Régénérer</button>' +
    '</div>';

    ORDRES_REPAS.forEach(function (type) {
      var r = platChoisi(type);
      var analyse = r ? analyserRecette(r) : null;
      html += '<div class="poste' + (r ? ' poste-rempli' : '') + '">' +
        '<div class="poste-tete"><span class="poste-nom">' + LIBELLE_REPAS[type] + '</span>' +
          (r ? '<span class="poste-kcal">' + analyse.kcal + ' kcal</span>' : '') +
        '</div>';

      if (r) {
        html += '<div class="poste-choisi">' +
          '<div><strong>' + esc(r.name) + '</strong>' +
            (r.desc ? '<div style="font-size:.8rem;color:var(--gris)">' + esc(r.desc) + '</div>' : '') +
            (analyse.nbManquants
              ? '<div style="font-size:.8rem;color:var(--orange);margin-top:3px">' +
                analyse.nbManquants + ' ingrédient(s) manquant(s)</div>' : '') +
          '</div>' +
          '<div class="actions-manquant" style="margin:8px 0 0">' +
            '<button class="btn btn-ghost" data-act="voir-poste" data-type="' + type + '">Voir</button>' +
            '<button class="btn btn-danger" data-act="retirer-poste" data-type="' + type + '">Retirer</button>' +
          '</div></div>';
      } else {
        // On ne propose que ce qui tient encore dans le budget
        var candidats = platsDeType(type)
          .filter(function (a) { return a.kcal <= reste || total === 0; })
          .sort(function (a, b) { return b.score - a.score; })
          .slice(0, 4);
        html += '<div class="poste-vide">';
        if (!candidats.length) {
          html += '<span style="font-size:.83rem;color:var(--gris)">' +
            (total === 0 ? 'Aucun plat de ce type.' : 'Plus de place dans le budget.') +
            '</span>';
        } else {
          html += candidats.map(function (a) {
            return '<button class="choix-poste" data-act="prendre-poste" ' +
              'data-type="' + type + '" data-id="' + a.recette.id + '">' +
              '<span>' + esc(a.recette.name) + '</span>' +
              '<span class="kcal-mini">' + a.kcal + ' kcal</span></button>';
          }).join('');
        }
        html += '</div>';
      }
      html += '</div>';
    });

    zone.innerHTML = html;

    var b = el('btn-proposer-repas');
    if (b) b.addEventListener('click', function () {
      composition = propositionsRepas();
      sauvegarderComposition();
      rafraichir();
    });
    var br = el('btn-regen-repas');
    if (br) br.addEventListener('click', function () {
      composition = propositionsRepas();
      sauvegarderComposition();
      rafraichir();
      toast('Propositions régénérées');
    });
    zone.querySelectorAll('[data-act]').forEach(function (n) {
      n.addEventListener('click', function () {
        var act = n.getAttribute('data-act');
        if (act === 'prendre-poste') {
          composition[n.getAttribute('data-type')] = n.getAttribute('data-id');
        } else if (act === 'retirer-poste') {
          delete composition[n.getAttribute('data-type')];
        } else if (act === 'voir-poste') {
          // le bouton ne porte qu'un data-type : c'est la composition
          // qui fait le lien vers le plat choisi
          ouvrirRecette(composition[n.getAttribute('data-type')]);
          return;
        }
        sauvegarderComposition();
        rafraichir();
      });
    });
  }

  function sauvegarderComposition() {
    etat.repas = composition;
    sauver();
  }

  /* ============================================ MES RECETTES (écriture libre) */

  function recettesPersonnelles() { return etat.recettes || []; }

  function trouverRecettePerso(id) {
    return recettesPersonnelles().filter(function (r) { return r.id === id; })[0] || null;
  }

  /**
   * Éditeur de recette personnelle. Les ingrédients sont choisis dans le
   * catalogue (les calories se calculent alors automatiquement) ou en texte
   * libre. La recette est enregistrée dans le même format que celles de la
   * base, pour bénéficier du classement et de la détection d'ingrédients
   * manquants.
   */
  function editerRecette(existante) {
    var r = existante ? JSON.parse(JSON.stringify(existante)) : {
      id: uid('r'), nom: '', desc: '', cat: 'perso', time: 20,
      serv: 1, ing: [], etapes: [], perso: true
    };

    var ingredients = r.ing.map(function (i) { return { id: i.id, q: i.q, libre: i.libre || null }; });

    function ligneIngredient(i, index) {
      var a = i.id ? aliment(i.id) : null;
      var nom = i.libre || (a ? a.name : '—');
      var kcal = a ? Math.round(a.kcal * i.q / 100) : null;
      return '<div class="ing-ligne" data-ligne="' + index + '">' +
        '<span class="nom">' + esc(nom) +
          (a ? '' : ' <span class="puce puce-neutre">texte libre</span>') + '</span>' +
        (kcal !== null ? '<span class="kcal-mini">' + kcal + ' kcal</span>' : '') +
        '<input type="number" min="0" step="1" value="' + i.q + '" data-qte>' +
        '<span style="font-size:.8rem;color:var(--gris)">' +
          esc(a ? a.unit : 'g') + '</span>' +
        '<button class="btn btn-danger" data-suppr="' + index + '" ' +
          'style="padding:6px 10px;font-size:.75rem">✕</button>' +
      '</div>';
    }

    function corps() {
      return '<div class="champ"><label for="r-nom">Nom de la recette</label>' +
          '<input id="r-nom" type="text" value="' + esc(r.name) + '" ' +
          'placeholder="Ex. Gratin decourgette de Mamie"></div>' +

        '<div class="champ"><label for="r-desc">Description (facultatif)</label>' +
          '<input id="r-desc" type="text" value="' + esc(r.desc || '') + '" ' +
          'placeholder="Ce que cette recette a de particulier"></div>' +

        '<div class="row-actions">' +
          '<div style="flex:1"><label for="r-type">Type de plat</label>' +
            '<select id="r-type">' +
              ORDRES_REPAS.map(function (t) {
                return '<option value="' + t + '"' +
                  ((r.meal || 'plat') === t ? ' selected' : '') + '>' +
                  LIBELLE_REPAS[t] + '</option>';
              }).join('') +
            '</select>' +
            '<div class="aide">Détermine à quel moment de le repas la recette est servie.</div>' +
          '</div>' +
        '</div>' +

        '<div class="row-actions">' +
          '<div style="flex:1"><label for="r-serv">Portions</label>' +
            '<input id="r-serv" type="number" min="1" step="1" value="' + (r.serv || 1) + '"></div>' +
          '<div style="flex:1"><label for="r-time">Durée (min)</label>' +
            '<input id="r-time" type="number" min="1" step="5" value="' + (r.time || 20) + '"></div>' +
        '</div>' +

        '<label>Ingrédients</label>' +
        '<div id="r-ings">' + (ingredients.length
          ? ingredients.map(ligneIngredient).join('') : '') + '</div>' +
        '<div id="r-ings-vide" class="aide" style="margin:6px 0 8px">' +
          (ingredients.length ? '' : 'Aucun ingrédient pour l’instant.') + '</div>' +
        '<input id="r-recherche" type="search" placeholder="Ajouter un ingrédient…" ' +
          'autocomplete="off" style="margin-bottom:6px">' +
        '<div class="suggestions" id="r-suggestions"></div>' +

        '<label for="r-libre" style="margin-top:12px">Ingrédient hors catalogue</label>' +
        '<div class="row-actions">' +
          '<input id="r-libre" type="text" placeholder="Nom de l’ingrédient" style="flex:2">' +
          '<input id="r-libre-qte" type="number" min="0" step="1" value="100" ' +
            'style="flex:1" title="grammes">' +
          '<button class="btn btn-ghost" id="r-ajoute-libre">Ajouter</button>' +
        '</div>' +
        '<div class="aide">Les ingrédients hors catalogue n’ont pas de calories : ' +
          'elles ne seront pas comptées.</div>' +

        '<label for="r-etapes" style="margin-top:14px">Préparation (une étape par ligne)</label>' +
        '<textarea id="r-etapes" rows="5" ' +
          'placeholder="Couper les légumes&#10;Faire revenir la viande&#10;Enfourner 30 min">' +
          esc((r.steps || []).join('\n')) + '</textarea>' +

        '<div id="r-total" style="margin:14px 0"></div>' +

        '<button class="btn btn-primary btn-block" id="r-enregistrer">Enregistrer la recette</button>' +
        (existante
          ? '<button class="btn btn-danger btn-block" id="r-supprimer" style="margin-top:8px">' +
            'Supprimer cette recette</button>' : '');
    }

    function recalculer() {
      var tmp = { ing: ingredients.filter(function (i) { return i.id; }), serv: r.serv || 1 };
      var total = kcalRecette(tmp);
      var portion = total / (r.serv || 1);
      var zone = el('r-total');
      if (!zone) return;
      zone.innerHTML = ingredients.length
        ? '<div class="carte" style="box-shadow:none;background:' +
          (portion < etat.reglages.kcalMax ? 'var(--vert-clair)' : 'var(--orange-clair)') + '">' +
          '<strong>' + Math.round(portion) + ' kcal par portion</strong> — ' +
          Math.round(total) + ' kcal au total' +
          (portion >= etat.reglages.kcalMax
            ? '<div style="font-size:.82rem;color:var(--orange);margin-top:4px">' +
              'Au-dessus de ton plafond : la recette sera masquée dans le classement.</div>'
            : '') + '</div>'
        : '';
    }

    function redessinerIngredients() {
      var zone = el('r-ings');
      if (!zone) return;
      zone.innerHTML = ingredients.map(ligneIngredient).join('');
      el('r-ings-vide').hidden = ingredients.length > 0;
      Array.prototype.forEach.call(zone.querySelectorAll('[data-suppr]'), function (b) {
        b.addEventListener('click', function () {
          ingredients.splice(Number(b.getAttribute('data-suppr')), 1);
          redessinerIngredients(); recalculer();
        });
      });
      Array.prototype.forEach.call(zone.querySelectorAll('[data-qte]'), function (n) {
        n.addEventListener('change', function () {
          var i = ingredients[Number(n.closest('[data-ligne]').getAttribute('data-ligne'))];
          i.q = Math.max(0, Number(n.value) || 0);
          redessinerIngredients(); recalculer();
        });
      });
      recalculer();
    }

    ouvrirModale(existante ? 'Modifier ma recette' : 'Nouvelle recette', corps());
    redessinerIngredients();

    // --- recherche d'ingrédients dans le catalogue
    var champIng = el('r-recherche');
    var minuteur = null;
    champIng.addEventListener('input', function () {
      clearTimeout(minuteur);
      var t = champIng.value.trim().toLowerCase();
      var zone = el('r-suggestions');
      if (t.length < 1) { zone.innerHTML = ''; return; }
      var pool = CATALOGUE.concat(
        Object.keys(etat.produits || {}).map(function (k) { return etat.produits[k]; })
      ).filter(function (a) {
        return a.name.toLowerCase().indexOf(t) >= 0 ||
          (a.marque || '').toLowerCase().indexOf(t) >= 0;
      }).slice(0, 40);

      zone.innerHTML = pool.length
        ? pool.map(function (a) {
            return '<div class="suggestion" data-ajout="' + a.id + '">' +
              '<span>' + esc(a.name) + (a.magasin ? ' <span class="puce puce-neutre">' +
                esc(a.magasin) + '</span>' : '') + '</span>' +
              '<span class="kcal-mini">' + a.kcal + ' kcal/100' + esc(a.unit) + '</span></div>';
          }).join('')
        : '<div class="suggestion">Aucun aliment du catalogue — utilise le champ « hors catalogue »</div>';

      Array.prototype.forEach.call(zone.querySelectorAll('[data-ajout]'), function (n) {
        n.addEventListener('click', function () {
          var a = aliment(n.getAttribute('data-ajout'));
          if (!a) return;
          ingredients.push({ id: a.id, q: 100, libre: null });
          champIng.value = '';
          zone.innerHTML = '';
          redessinerIngredients();
        });
      });
    });

    el('r-ajoute-libre').addEventListener('click', function () {
      var nom = el('r-libre').value.trim();
      if (!nom) { toast('Indique le nom de l’ingrédient'); return; }
      ingredients.push({
        id: 'libre_' + nom.toLowerCase().replace(/\s+/g, '_'),
        q: Math.max(0, Number(el('r-libre-qte').value) || 0),
        libre: nom
      });
      el('r-libre').value = '';
      redessinerIngredients();
    });

    el('r-enregistrer').addEventListener('click', function () {
      r.name = el('r-nom').value.trim();
      if (!r.name) { toast('Donne un nom à ta recette'); return; }
      if (!ingredients.length) { toast('Ajoute au moins un ingrédient'); return; }

      r.desc = el('r-desc').value.trim();
      r.meal = el('r-type').value || 'plat';
      r.serv = Math.max(1, Number(el('r-serv').value) || 1);
      r.time = Math.max(1, Number(el('r-time').value) || 20);
      r.ing = ingredients.filter(function (i) { return i.q > 0; });
      r.steps = el('r-etapes').value.split('\n')
        .map(function (l) { return l.trim(); }).filter(Boolean);
      r.perso = true;
      r.cat = 'perso';

      // un ingrédient « texte libre » devient un produit à part entière,
      // pour que les calories soient calculables si l'utilisateur les renseigne
      // plus tard.
      r.ing.forEach(function (i) {
        if (i.libre && !aliment(i.id)) {
          etat.produits[i.id] = {
            id: i.id, name: i.libre, cat: 'condiments', kcal: 0, unit: 'g',
            fresh: false, perish: null, libre: true
          };
        }
      });

      var i = recettesPersonnelles().findIndex(function (x) { return x.id === r.id; });
      if (i >= 0) etat.recettes[i] = r; else etat.recettes.push(r);

      sauver();
      fermerModale();
      filtreRecette = 'moi';
      rafraichir();
      toast(existante ? 'Recette mise à jour' : 'Recette ajoutée à tes recettes');
    });

    var btnSuppr = el('r-supprimer');
    if (btnSuppr) {
      btnSuppr.addEventListener('click', function () {
        if (!confirm('Supprimer « ' + r.name + ' » ?')) return;
        etat.recettes = recettesPersonnelles().filter(function (x) { return x.id !== r.id; });
        sauver();
        fermerModale();
        rafraichir();
        toast('Recette supprimée');
      });
    }
  }

  /* ==================================== BASE DE PRODUITS (code-barres) */

  /* Open Food Facts : base libre de produits, dont de nombreux français.
   *
   * Seule la lecture d'un produit par code-barres est utilisée :
   * les endpoints de recherche plein texte d'Open Food Facts n'envoient pas
   * d'en-tête CORS et renvoient des 503, ils sont donc inaccessibles depuis
   * un navigateur. L'API produit, elle, répond et autorise l'origine.
   *
   * C'est la seule source réseau de l'application : tout le reste (stock,
   * goûts, courses, recettes) reste sur l'appareil, et rien n'est transmis
   * en dehors du code-barres que tu scanninges.
   */
  var OFF_PRODUIT = 'https://world.openfoodfacts.org/api/v2/product/';

  function offKcal(nutriments) {
    if (!nutriments) return null;
    var v = nutriments['energy-kcal_100g'];
    if (typeof v === 'number' && v > 0) return Math.round(v);
    var kj = nutriments['energy_100g'];
    if (typeof kj === 'number' && kj > 0) return Math.round(kj / 4.184);
    return null;
  }

  /** Devine une catégorie à partir des tags Open Food Facts. */
  function offCategorie(tags) {
    var t = (tags || []).join(' ');
    if (/saucisse|charcuterie|jambon|lardon|viande|poisson|meat|sausage/.test(t)) return 'proteines';
    if (/fromage|lait|yaourt|creme|dairy/.test(t)) return 'laitages';
    if (/pain|cereale|riz|pate|farine|biscuit|cake|patisserie|pizza/.test(t)) return 'cereales';
    if (/fruit/.test(t)) return 'fruits';
    if (/legume|vegetable|salade/.test(t)) return 'legumes';
    if (/boisson|drink|eau|water|jus|limonade/.test(t)) return 'boissons';
    if (/chocolat|sucre|confiture|sirop/.test(t)) return 'sucrants';
    return 'condiments';
  }

  function offEnProduit(p) {
    var nom = (p.product_name || p.generic_name || '').trim();
    var kcal = offKcal(p.nutriments);
    if (!nom) return null;   // sans nom, inutile

    return {
      id: 'off_' + (p.code || uid('p')),
      name: nom,
      cat: offCategorie(p.categories_tags),
      // kcal à 0 si la fiche n'a pas la valeur : l'aliment reste sélectionnable,
      // il ne simplement ne comptera pas dans les totaux.
      kcal: kcal === null ? 0 : kcal,
      unit: 'g',
      // un produit emballé n'est pas « frais » : la priorité aux
      // péérissables ne doit pas être faussée par une conserverie
      fresh: false,
      perish: null,
      marque: (p.brands || '').split(',')[0].trim() || null,
      magasin: (p.stores || '').split(',')[0].trim() || null,
      conditionnement: p.quantity || null,
      off: true
    };
  }

  /** Interroge Open Food Facts à partir d'un code-barres (EAN/UPC). */
  function chercherParCode(code, rappel) {
    var propre = String(code || '').replace(/\D/g, '');
    if (propre.length < 8) { rappel(null, 'Code-barres illisible'); return; }

    fetch(OFF_PRODUIT + propre + '.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var p = d && (d.product || d);
        if (!p || !p.product_name) {
          rappel(null, 'Produit inconnu de la base');
          return;
        }
        var produit = offEnProduit(p);
        if (!produit) { rappel(null, 'Produit illisible'); return; }
        if (!offKcal(p.nutriments)) produit.sansCalories = true;
        rappel(produit, null);
      })
      .catch(function () {
        rappel(null, 'Recherche en ligne indisponible (pas de réseau ?)');
      });
  }

  /** Enregistre un produit trouvé en ligne pour pouvoir le réutiliser. */
  function enregistrerProduit(p) {
    etat.produits[p.id] = p;
    sauver();
    return p.id;
  }

  /* --------------------------------------------------------- scanner */

  var fluxVideo = null;

  function arreterCamera() {
    if (fluxVideo) {
      fluxVideo.getTracks().forEach(function (t) { t.stop(); });
      fluxVideo = null;
    }
  }

  /**
   * Lit un code-barres avec l'appareil photo.
   * Utilise l'API native BarcodeDetector quand elle existe (Android, Chrome),
   * sinon jsQR embarqué.
   */
  /** Un code-barres valide est un simple nombre de 8 à 14 chiffres. */
  function codeValide(code) {
    return /^[0-9]{8,14}$/.test(String(code || '').trim());
  }

  /**
   * Lit un code-barres avec l'appareil photo.
   * API BarcodeDetector native quand elle existe (Android, Chrome),
   * sinon jsQR embarqué.
   *
   * Deux garde-fous indispensables : on n'analyse qu'une fois la vidéo
   * réellement diffusée (sinon une frame vide est décodée en bruit), et on
   * n'accepte un code qu'après deux lectures identiques consécutives.
   */
  function scannerCodeBarres(rappel) {
    ouvrirModale('Scanner un code-barres',
      '<div class="scanner"><video id="scan-video" playsinline muted ' +
        'style="width:100%;border-radius:12px;background:#000"></video>' +
        '<div class="scan-cadre"></div></div>' +
      '<p class="aide" id="scan-msg">Démarrage de la caméra…</p>' +
      '<div class="actions-manquant" style="margin-top:12px">' +
        '<button class="btn btn-ghost" id="scan-manuel">Saisir le code à la main</button>' +
      '</div>');

    var msg = document.getElementById('scan-msg');
    var video = el('scan-video');
    var arrete = false;
    var dernier = null, repetitions = 0;

    // même validation pour les deux moteurs de décodage
    function proposer(brut) {
      var code = String(brut || '').replace(/\D/g, '');
      if (!codeValide(code)) return false;
      if (code === dernier) {
        repetitions++;
      } else {
        dernier = code;
        repetitions = 1;
      }
      // deux lectures identiques : on évite les faux positifs de bruit
      if (repetitions >= 2) { accepte(code); return true; }
      msg.textContent = 'Code détecté : ' + code + ' — confirmation…';
      return true;
    }

    function accepte(code) {
      if (arrete) return;
      arrete = true;
      arreterCamera();
      chercherParCode(code, function (produit, erreur) {
        if (produit) {
          // le rappel rouvre la fiche d'ajout : pas besoin de fermer ici,
          // et surtout il ne faut pas laisser l'utilisateur sans formulaire
          rappel(produit);
        } else {
          afficherEchecScan(code, erreur);
        }
      });
    }

    /**
     * Écran « produit non trouvé ». On reconstruit tout le contenu de la
     * modale courante : elle a pu être remplacée entre-temps (saisie
     * manuelle), et un message écrit dans l'ancien écran resterait
     * invisible — c'est ce qui laissait un écran noir.
     */
    function afficherEchecScan(code, erreur) {
      var corps = el('modal-body');
      if (!corps) return;
      corps.innerHTML =
        '<div class="carte" style="box-shadow:none;background:var(--orange-clair);' +
        'text-align:center;padding:18px">' +
        '<div style="font-size:2rem">🔍</div>' +
        '<strong>Produit non trouvé</strong>' +
        '<div style="font-size:.85rem;margin-top:6px">' + esc(erreur) + '</div>' +
        '<div style="font-size:.8rem;color:var(--gris);margin-top:6px">' +
          'Code scanné : <strong>' + esc(code) + '</strong></div>' +
        '<div style="font-size:.8rem;color:var(--gris);margin-top:10px">' +
          'Open Food Facts est une base communautaire : beaucoup de produits ' +
          'n’y sont pas encore référencés. Tu peux l’ajouter à la main, ' +
          'l’app le gardera pour les prochaines fois.</div>' +
        '</div>' +
        '<div class="actions-manquant">' +
        '<button class="btn btn-accent" id="scan-manuel2">Ajouter à la main</button>' +
        '<button class="btn btn-ghost" id="scan-retry">Réessayer</button></div>';

      el('scan-retry').addEventListener('click', function () {
        dernier = null; repetitions = 0;
        scannerCodeBarres(rappel);
      });
      el('scan-manuel2').addEventListener('click', function () {
        dernier = null; repetitions = 0;
        rappel(null);          // rouvre une fiche d'ajout vierge
      });
    }

    el('scan-manuel').addEventListener('click', function () {
      arreterCamera();
      ouvrirModale('Saisir le code-barres',
        '<div class="champ"><label for="code-barre">Numéro sous le code-barres</label>' +
        '<input id="code-barre" type="tel" inputmode="numeric" placeholder="Ex. 3017620422003"></div>' +
        '<button class="btn btn-primary btn-block" id="code-valider">Rechercher ce produit</button>');
      el('code-valider').addEventListener('click', function () {
        var c = el('code-barre').value.replace(/\D/g, '');
        if (!codeValide(c)) { toast('Code-barres invalide'); return; }
        accepte(c);
      });
    });

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      msg.innerHTML = '<strong style="color:var(--rouge)">Caméra indisponible</strong><br>' +
        'Utilise un navigateur récent, ou ajoute l’aliment à la main.';
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }
    }).then(function (flux) {
      if (arrete) { flux.getTracks().forEach(function (t) { t.stop(); }); return; }
      fluxVideo = flux;
      video.srcObject = flux;

      // On n'analyse qu'une fois la vidéo diffusée : avant, le décodeur
      // travaille sur une image vide et renvoie n'importe quoi.
      video.addEventListener('playing', function () {
        if (arrete) return;
        msg.textContent = 'Cadre le code-barres dans le rectangle. Le scan est automatique.';

        if ('BarcodeDetector' in window) {
          var detecteur = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
          });
          var boucleNative = function () {
            if (arrete) return;
            detecteur.detect(video).then(function (codes) {
              if (codes && codes.length) {
                codes.forEach(function (c) { if (proposer(c.rawValue)) return; });
              }
              requestAnimationFrame(boucleNative);
            }).catch(function () { requestAnimationFrame(boucleNative); });
          };
          requestAnimationFrame(boucleNative);
        } else {
          if (typeof window.jsQR !== 'function') {
            msg.textContent = 'Chargement du décodeur…';
            chargerJsQR(function (charge) {
              if (arrete) return;
              if (!charge) {
                msg.innerHTML = '<strong style="color:var(--rouge)">Décodeur indisponible</strong>';
                return;
              }
              msg.textContent = 'Cadre le code-barres dans le rectangle.';
              boucleJsQR(video, proposer, function () {
                if (!arrete) msg.innerHTML = '<strong style="color:var(--rouge)">' +
                  'Caméra inaccessible</strong><br>Autorise la caméra dans les réglages.';
              });
            });
          } else {
            msg.textContent = 'Cadre le code-barres dans le rectangle.';
            boucleJsQR(video, proposer, function () {
              if (!arrete) msg.innerHTML = '<strong style="color:var(--rouge)">' +
                'Caméra inaccessible</strong><br>Autorise la caméra dans les réglages.';
            });
          }
        }
      });

      var demarrage = video.play();
      if (demarrage && demarrage.catch) demarrage.catch(function () {
        if (!arrete) msg.innerHTML = '<strong style="color:var(--rouge)">' +
          'Caméra refusée</strong><br>Autorise la caméra, ou saisis le code à la main.';
      });
    }).catch(function () {
      msg.innerHTML = '<strong style="color:var(--rouge)">Caméra refusée</strong><br>' +
        'Autorise la caméra pour ce site, ou saisis le code à la main.';
    });
  }

  var jsqrCharge = null;
  function chargerJsQR(rappel) {
    if (jsqrCharge) { rappel(jsqrCharge); return; }
    var s = document.createElement('script');
    s.src = 'js/jsQR.js';
    s.onload = function () { jsqrCharge = true; rappel(true); };
    s.onerror = function () { jsqrCharge = false; rappel(false); };
    document.head.appendChild(s);
  }

  /** Boucle de décodage jsQR à partir d'un flux vidéo. */
  function boucleJsQR(video, fini, echec) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d', { willReadFrequently: true });

    var boucler = function () {
      if (!fluxVideo) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var code = window.jsQR(img.data, img.width, img.height);
          if (code && code.data) { fini(code.data); return; }
        } catch (e) { echec(e); return; }
      }
      requestAnimationFrame(boucler);
    };
    requestAnimationFrame(boucler);
  }

  /* ============================================ « J'AI MANGÉ » */

  /**
   * Sort une quantité du stock sans passer par une recette.
   * Utile quand tu as mangé un morceau de pain, ou une envie qui n'est
   * dans aucun repas proposé.
   */
  function modaleConsommer(foodId, nomLigne, qteLigne) {
    var id = foodId || null;
    var uniteMange = 'g';

    ouvrirModale('J’ai mangé',
      '<div class="champ"><label for="c-recherche">Aliment consommé</label>' +
        '<input id="c-recherche" type="search" placeholder="Rechercher un aliment…" autocomplete="off">' +
        '<div class="suggestions" id="c-suggestions"></div></div>' +
      '<div id="c-choisi"></div>' +
      '<div id="c-champs" hidden>' +
        '<div class="champ">' +
          '<div class="champ-unite"><label for="c-qte">Quantité consommée</label>' +
            '<div class="bascule" id="c-bascule" hidden>' +
              '<button type="button" class="on" data-u="g">grammes</button>' +
              '<button type="button" data-u="piece">pièces</button>' +
            '</div></div>' +
          '<input id="c-qte" type="number" inputmode="decimal" min="0" step="1">' +
          '<div class="aide" id="c-aide"></div>' +
        '</div>' +
        '<div class="champ" id="c-restes"></div>' +
        '<button class="btn btn-ghost btn-block" id="c-ajout-stock" hidden></button>' +
        '<button class="btn btn-primary btn-block" id="c-valider">Sortir du stock</button>' +
      '</div>');

    function stockDe(fid) {
      return (etat.stock.filter(function (l) { return l.foodId === fid; })
        .reduce(function (s, l) { return s + l.qty; }, 0));
    }

    function afficher() {
      var a = id ? aliment(id) : null;
      if (!a) { el('c-choisi').innerHTML = ''; el('c-champs').hidden = true; return; }
      var dispo = stockDe(id);
      var p = poidsUnite(id);
      el('c-choisi').innerHTML = '<div class="carte" style="padding:10px;margin:10px 0 0;' +
        'box-shadow:none;background:' + (dispo > 0 ? 'var(--vert-clair)' : 'var(--orange-clair)') +
        '"><strong>' + esc(a.name) + '</strong> — ' +
        (dispo > 0
          ? 'en stock : ' + esc(fmtQuantite(a, dispo, a.unit))
          : '<span style="color:var(--orange)">pas dans ton stock</span>') + '</div>';
      el('c-champs').hidden = false;

      var bascule = el('c-bascule');
      bascule.hidden = !p;
      bascule.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-u') === (uniteMange === 'piece' ? 'piece' : 'g'));
      });

      if (!el('c-qte').value) {
        el('c-qte').value = uniteMange === 'piece' && dispo > 0
          ? (enPieces(a, dispo) || 1)
          : (dispo > 0 ? Math.round(dispo) : 100);
      }
      majRestes();
    }

    function majRestes() {
      var a = id ? aliment(id) : null;
      if (!a) return;
      var saisie = Number(el('c-qte').value) || 0;
      var q = Math.round(enGrammes(a, saisie, uniteMange === 'piece'));
      var dispo = stockDe(id);
      var reste = dispo - q;
      var p = poidsUnite(id);
      var zone = el('c-restes');
      var bouton = el('c-valider');

      var aide = el('c-aide');
      if (aide) {
        if (!p) {
          aide.textContent = '';
        } else if (uniteMange === 'piece') {
          aide.textContent = '1 ' + p.label + ' = ' + p.g + ' g';
        } else {
          var n = enPieces(a, q) || 0;
          aide.textContent = n > 0
            ? 'Soit environ ' + n + ' ' + (n > 1 ? (p.pluriel || p.label + 's') : p.label)
            : '';
        }
      }

      if (dispo <= 0) {
        // Rien à retirer : on ne simule pas, on propose de l'ajouter.
        zone.innerHTML = '<div class="aide" style="color:var(--orange)">' +
          'Cet aliment n’est pas dans ton stock : ajoute-le d’abord pour pouvoir ' +
          'le sortir à la bonne quantité.</div>';
        var ajout = el('c-ajout-stock');
        ajout.hidden = false;
        ajout.textContent = '+ Ajouter ' + fmtQuantite(a, q, a.unit) + ' au stock';
        ajout.onclick = function () { ouvrirModaleAjoutAvecQuantite(a.id, q); };
        bouton.hidden = true;
        return;
      }

      el('c-ajout-stock').hidden = true;
      bouton.hidden = false;

      if (reste > 0) {
        zone.innerHTML = '<div class="aide">Il restera ' +
          esc(fmtQuantite(a, reste, a.unit)) + ' en stock.</div>';
      } else if (reste === 0) {
        zone.innerHTML = '<div class="aide">Le stock de ' + esc(a.name) +
          ' sera entièrement consommé.</div>';
      } else {
        zone.innerHTML = '<div class="aide" style="color:var(--orange)">' +
          'Tu n’as que ' + esc(fmtQuantite(a, dispo, a.unit)) +
          ' en stock : la ligne sera retirée entièrement.</div>';
      }
    }

    function liste(t) {
      var q = String(t || '').trim().toLowerCase();
      var pool = CATALOGUE.concat(
        Object.keys(etat.produits || {}).map(function (k) { return etat.produits[k]; })
      ).filter(function (a) {
        if (!q) return true;
        return a.name.toLowerCase().indexOf(q) >= 0 || (a.marque || '').toLowerCase().indexOf(q) >= 0;
      }).slice(0, 40);

      // les aliments réellement en stock remontent d'abord
      pool.sort(function (x, y) { return stockDe(y.id) - stockDe(x.id); });

      el('c-suggestions').innerHTML = pool.map(function (a) {
        var d = stockDe(a.id);
        return '<div class="suggestion" data-food="' + a.id + '"><span>' + esc(a.name) +
          (d > 0 ? ' <span class="puce puce-ok">' + fmtQte(d) + ' en stock</span>' : '') +
          '</span><span class="kcal-mini">' + (a.kcal || '?') + ' kcal/100' + esc(a.unit) +
          '</span></div>';
      }).join('');

      el('c-suggestions').querySelectorAll('[data-food]').forEach(function (n) {
        n.addEventListener('click', function () {
          id = n.getAttribute('data-food');
          el('c-recherche').value = nomAliment(id);
          el('c-suggestions').innerHTML = '';
          afficher();
        });
      });
    }

    if (id) el('c-recherche').value = nomLigne || nomAliment(id);
    liste(id ? '' : '');
    afficher();

    el('c-recherche').addEventListener('input', function () {
      id = null;
      el('c-champs').hidden = true;
      el('c-choisi').innerHTML = '';
      liste(el('c-recherche').value);
    });
    el('c-qte').addEventListener('input', majRestes);

    el('c-bascule').querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = id ? aliment(id) : null;
        if (!a || !a.piece) return;
        var versPieces = b.getAttribute('data-u') === 'piece';
        if ((versPieces && uniteMange === 'piece') || (!versPieces && uniteMange === 'g')) return;
        basculerUnite(el('c-qte'), a, versPieces);
        uniteMange = versPieces ? 'piece' : 'g';
        afficher();
      });
    });

    el('c-valider').addEventListener('click', function () {
      if (!id) { toast('Choisis un aliment'); return; }
      var a = aliment(id);
      var saisie = Number(el('c-qte').value);
      var q = Math.round(enGrammes(a, saisie, uniteMange === 'piece'));
      if (q <= 0) { toast('Indique une quantité'); return; }

      var restant = q;
      for (var i = etat.stock.length - 1; i >= 0 && restant > 0; i--) {
        var l = etat.stock[i];
        if (l.foodId !== id) continue;
        if (l.qty <= restant) { restant -= l.qty; etat.stock.splice(i, 1); }
        else { l.qty -= restant; restant = 0; }
      }
      sauver();
      fermerModale();
      rafraichir();
      toast('–' + fmtQuantite(a, q, a ? a.unit : 'g') + ' de ' +
        esc(nomAliment(id)));
    });
  }

  /** Ouvre la fiche d'ajout avec un aliment et une quantité pré-remplis. */
  function ouvrirModaleAjoutAvecQuantite(foodId, qte) {
    modaleAjoutAliment(null);
    choisir(foodId);
    var champ = el('m-qte');
    if (champ && qte) champ.value = qte;
  }

  /* ------------------------------------------------------------ quantités */

  /** Poids d'une unité (un œuf, une pomme, une tranche…), s'il est connu. */
  function poidsUnite(foodId) {
    var a = aliment(foodId);
    return (a && a.piece && typeof a.piece.g === 'number' && a.piece.g > 0) ? a.piece : null;
  }

  /** Convertit une saisie utilisateur (grammes ou pièces) en grammes. */
  function enGrammes(a, valeur, enPieces) {
    var n = Number(valeur);
    if (!isFinite(n) || n < 0) return 0;
    return (enPieces && a && a.piece) ? n * a.piece.g : n;
  }

  /** Convertit des grammes en nombre de pièces (arrondi au dixième). */
  function enPieces(a, grammes) {
    if (!a || !a.piece || !a.piece.g) return null;
    var n = grammes / a.piece.g;
    return Math.round(n * 10) / 10;
  }

  /** Bascule g ↔ pièces dans un champ quantité. */
  function basculerUnite(champ, a, versPieces) {
    if (!a || !a.piece) return;
    var brut = String(champ.value).trim();
    // un champ vide reste vide : on n'invente pas de « 0 »
    if (brut === '') {
      uniteCourante = versPieces ? 'piece' : 'g';
      afficherChoisi();
      return;
    }
    var courant = Number(brut) || 0;
    if (versPieces) {
      var n = enPieces(a, courant);
      if (n === null) return;
      champ.value = (Math.abs(n - Math.round(n)) < 0.05) ? Math.round(n) : n;
    } else {
      champ.value = Math.round(courant * a.piece.g);
    }
    champ.dispatchEvent(new Event('input', { bubbles: true }));
    champ.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
 * Exprime une quantité à la pièce quand c'est possible : 300 g d'œufs
 * deviennent « 6 œufs ». Renvoie null si ce n'est pas un nombre entier
 * d'unités (250 g d'œufs reste 250 g).
 */
  function libelleUnites(a, grammes) {
    if (!a || !a.piece || !a.piece.g) return null;
    var n = (Number(grammes) || 0) / a.piece.g;
    if (n < 0.5) return null;
    var entier = Math.round(n);
    if (Math.abs(n - entier) > 0.12) return null;
    var mot = entier > 1 ? (a.piece.pluriel || (a.piece.label + 's')) : a.piece.label;
    return entier + ' ' + mot;
  }

  /** Quantité formatée : « 6 œufs · 300 g » quand c'est possible. */
  function fmtQuantite(a, grammes, unite) {
    var base = fmtQte(grammes) + ' ' + (unite || 'g');
    var p = libelleUnites(a, grammes);
    return p ? p + ' · ' + base : base;
  }

  /* ========================================================== RECETTES */

  function kcalRecette(r) {
    return r.ing.reduce(function (s, i) {
      var a = aliment(i.id);
      return s + (a ? a.kcal * i.q / 100 : 0);
    }, 0);
  }

  function kcalParPortion(r) { return kcalRecette(r) / (r.serv || 1); }

  /** Recettes intégrées + recettes écrites par l'utilisateur. */
  function toutesRecettes() {
    return RECETTES.concat(etat.recettes || []);
  }

  function statutDe(foodId) {
    var p = etat.prefs[foodId];
    return p ? p.statut : null;
  }

  function excluDeRecette(foodId) {
    var s = statutDe(foodId);
    return s === 'pas_aime' || s === 'eviter';
  }

  /**
   * Note une recette : ce que tu as déjà, en priorité ce qui périme,
   * et malus si il manque des ingrédients ou si tu n'aimes pas un truc.
   */
  function analyserRecette(r, parId) {
    var stock = parId || totalStock();
    var score = 0, manquants = [], aimes = 0, urgents = 0, couverts = 0;
    var exclue = false;

    r.ing.forEach(function (i) {
      var a = aliment(i.id);
      if (excluDeRecette(i.id)) { exclue = true; score -= 500; return; }
      if (statutDe(i.id) === 'aime') { aimes++; score += 8; }

      // « couvert » = on a la quantité nécessaire (et pas 1 gramme de plus)
      var dispo = stock[i.id] || 0;
      if (dispo >= i.q) {
        couverts++;
        score += 25;
        // Prime forte pour un aliment frais qui va périmer.
        var pire = plusUrgentDe(i.id);
        if (pire !== null) {
          if (pire <= 2) { score += 35; urgents++; }
          else if (pire <= 5) { score += 22; urgents++; }
          else if (a && a.fresh) score += 10;
        }
      } else {
        score -= 15;
        manquants.push(i);
      }
    });

    // Bonus si la recette est 100 % couverte par le stock (encourage à cuisiner avec ce qu'on a)
    if (manquants.length === 0 && r.ing.length > 0) score += 60;

    // Un petit biais vers les repas rapides
    score += Math.max(0, 40 - r.time) / 10;

    return {
      recette: r,
      score: score,
      manquants: manquants,
      nbManquants: manquants.length,
      nbCouverts: couverts,
      total: r.ing.length,
      aimes: aimes,
      urgents: urgents,
      exclue: exclue,
      kcal: Math.round(kcalParPortion(r))
    };
  }

  /** Nombre de jours restants du plus périmé d'un aliment en stock. */
  function plusUrgentDe(foodId) {
    var pire = null;
    etat.stock.forEach(function (l) {
      if (l.foodId !== foodId || !l.expiry) return;
      var j = joursRestants(l.expiry);
      if (pire === null || j < pire) pire = j;
    });
    return pire;
  }

  var filtreRecette = 'tout';
  var modeRecettes = 'repas';

  function rendreRecettes() {
    var fmode = el('mode-filtres');
    if (fmode) {
      fmode.innerHTML =
        '<button class="filtre' + (modeRecettes === 'repas' ? ' is-actif' : '') +
          '" data-mode="repas">🍽 Repas complet</button>' +
        '<button class="filtre' + (modeRecettes === 'liste' ? ' is-actif' : '') +
          '" data-mode="liste">📋 Liste de plats</button>';
      fmode.querySelectorAll('[data-mode]').forEach(function (n) {
        n.addEventListener('click', function () {
          modeRecettes = n.getAttribute('data-mode');
          rendreRecettes();
        });
      });
    }

    if (modeRecettes === 'repas') {
      rendreCompositeur();
      el('recipe-filters').hidden = true;
      el('recipe-list').innerHTML = '';
      return;
    }
    rendreCompositeur();
    el('recipe-filters').hidden = false;

    var analyses = toutesRecettes().map(function (r) { return analyserRecette(r); })
      .filter(function (a) { return !a.exclue; })
      .filter(function (a) {
        // Le plafond ne sert qu'à trier les suggestions automatiques.
        // Tes propres recettes restent toujours visibles, même au-dessus :
        // elles doivent être modifiables, pas disparaître.
        return a.kcal < etat.reglages.kcalMax || filtreRecette === 'moi';
      });

    if (filtreRecette === 'complet') {
      analyses = analyses.filter(function (a) { return a.nbManquants === 0; });
    } else if (filtreRecette === 'urgent') {
      analyses = analyses.filter(function (a) { return a.urgents > 0; });
    } else if (filtreRecette === 'aime') {
      analyses = analyses.filter(function (a) { return a.aimes > 0; });
    } else if (filtreRecette === 'moi') {
      analyses = analyses.filter(function (a) { return a.recette.perso; });
    }

    analyses.sort(function (a, b) { return b.score - a.score; });

    var f = el('recipe-filters');
    var defs = [
      ['tout', 'Toutes'], ['complet', 'Sans manque'], ['urgent', 'À sauver'],
      ['aime', 'Tu aimes ça'], ['moi', 'Mes recettes (' + (etat.recettes || []).length + ')']
    ];
    f.innerHTML = '<button class="filtre" id="btn-recette-perso">+ Ma recette</button>' +
      defs.map(function (d) {
        return '<button class="filtre' + (filtreRecette === d[0] ? ' is-actif' : '') +
          '" data-filtre="' + d[0] + '">' + d[1] + '</button>';
      }).join('');
    el('btn-recette-perso').addEventListener('click', function () { editerRecette(null); });
    Array.prototype.forEach.call(f.querySelectorAll('[data-filtre]'), function (n) {
      n.addEventListener('click', function () {
        filtreRecette = n.getAttribute('data-filtre');
        rendreRecettes();
      });
    });

    var ens = el('recipe-list');
    if (!analyses.length) {
      ens.innerHTML = '<div class="vide"><span class="grand">🍽</span>' +
        'Aucune recette ne correspond à ce filtre.<br>Ajoute des aliments à ton stock.</div>';
      return;
    }

    ens.innerHTML = analyses.map(function (a) {
      var pct = Math.round((a.nbCouverts / a.total) * 100);
      var sur = a.nbManquants === 0
        ? '<span class="puce puce-ok">Tu as tout</span>'
        : '<span class="puce puce-bientot">' + a.nbManquants + ' manquant' + (a.nbManquants > 1 ? 's' : '') + '</span>';
      var urg = a.urgents > 0
        ? '<span class="puce puce-expire">🥕 sauve ' + a.urgents + '</span>' : '';
      var aime = a.aimes > 0 ? '<span class="puce puce-bleu">💚 ' + a.aimes + '</span>' : '';
      return '<div class="carte" data-recette="' + a.recette.id + '">' +
        '<div class="ligne">' +
          '<div class="croissance"><h3>' + esc(a.recette.name) + '</h3>' +
            '<p>' + esc(a.recette.desc || '') + '</p></div>' +
          '<span class="puce puce-kcal">' + a.kcal + ' kcal</span>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:9px">' +
          sur + urg + aime +
          '<span class="puce puce-neutre">' + a.nbCouverts + '/' + a.total + ' en stock</span>' +
          '<span class="puce puce-neutre">⏱ ' + a.recette.time + ' min</span>' +
        '</div>' +
        '<div class="actions-manquant">' +
          '<button class="btn btn-primary" data-act="ouvrir-recette" data-id="' + a.recette.id + '">Voir la recette</button>' +
        '</div>' +
      '</div>';
    }).join('');

    Array.prototype.forEach.call(ens.querySelectorAll('[data-act="ouvrir-recette"]'), function (n) {
      n.addEventListener('click', function () { ouvrirRecette(n.getAttribute('data-id')); });
    });
  }

  /* ------------------------------------------- fiche recette + « tu l'as ? » */

  function ouvrirRecette(id) {
    var r = toutesRecettes().filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    var a = analyserRecette(r);
    var stock = totalStock();

    var corps = '';

    if (a.nbManquants > 0) {
      corps += '<div class="jump">🤔 Il te manque ' + a.nbManquants +
        ' ingrédient(s). Tu les as peut-être oublié(s) ?</div>';
    } else if (a.urgents > 0) {
      corps += '<div class="jump">🥕 Cette recette sauve ' + a.urgents +
        ' aliment(s) qui périment bientôt.</div>';
    }

    corps += '<p style="font-size:.9rem;color:var(--gris);margin:0 0 6px">' +
      esc(r.desc || '') + '</p>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' +
        '<span class="puce puce-kcal">' + a.kcal + ' kcal/portion</span>' +
        '<span class="puce puce-neutre">' + (r.serv || 1) + ' portion(s)</span>' +
        '<span class="puce puce-neutre">⏱ ' + r.time + ' min</span>' +
      '</div>' +
      '<h3 style="margin:14px 0 6px;font-size:.95rem">Ingrédients</h3>';

    r.ing.forEach(function (i) {
      var al = aliment(i.id);
      var st = statutDe(i.id);
      var dispo = stock[i.id] || 0;
      var manque = dispo < i.q;
      var urgent = plusUrgentDe(i.id);

      corps += '<div class="etail-ingr">' +
        '<span>' + (manque ? '❌' : '✅') + '</span>' +
        '<span class="nom">' + esc(al ? al.name : i.id) +
          (st === 'aime' ? ' 💚' : (st === 'pas_aime' ? ' 🙅' : '')) +
          (urgent !== null && urgent <= 3 ? ' <span class="puce puce-expire">J' +
            (urgent < 0 ? '+' : '-') + Math.abs(urgent) + '</span>' : '') +
        '</span>' +
        '<span class="qte">' + fmtQte(i.q) + ' ' + esc(al ? al.unit : 'g') +
          (dispo > 0 ? ' · ' + fmtQte(dispo) + ' en stock' : '') + '</span>' +
      '</div>';

      // ---- LA question clé : l'ingrédient manque, tu l'as oublié ?
      if (manque) {
        corps += '<div class="manquant" data-bloc="' + i.id + '">' +
          '<strong>Tu n’as pas noté « ' + esc(al ? al.name : i.id) + ' » (' + fmtQte(i.q) +
          ' ' + esc(al ? al.unit : 'g') + ').</strong><br>' +
          '<span style="font-size:.83rem">Tu l’as peut-être simplement oublié ?</span>' +
          '<div class="actions-manquant">' +
            '<button class="btn btn-primary" data-act="oublie" data-id="' + i.id + '">Je l’ai !</button>' +
            '<button class="btn btn-accent" data-act="acheter" data-id="' + i.id + '">À acheter</button>' +
            '<button class="btn btn-danger" data-act="eviter" data-id="' + i.id + '">Ne pas utiliser</button>' +
          '</div>' +
        '</div>';
      }
    });

    corps += '<h3 style="margin:16px 0 6px;font-size:.95rem">Préparation</h3>' +
      '<ol class="etapes">' +
      (r.steps || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
      '</ol>' +
      '<div class="actions-manquant" style="margin-top:16px">' +
        '<button class="btn btn-primary" data-act="cuisiner" data-id="' + r.id + '">' +
          'J’ai cuisiné — sortir du stock</button>' +
        '<button class="btn btn-ghost" data-act="tout-acheter" data-id="' + r.id + '">' +
          'Mettre les manques en courses</button>' +
        (r.perso ? '<button class="btn btn-ghost" data-act="modifier-recette" data-id="' + r.id +
          '">Modifier ma recette</button>' : '') +
      '</div>';

    ouvrirModale(r.name, corps);

    var corps_ = el('modal-body');

    corps_.querySelectorAll('[data-act="oublie"]').forEach(function (b) {
      b.addEventListener('click', function () {
        ouvrirRecette(id);            // on ferme la fiche
        modaleAjoutAliment(null);     // puis on demande quantité + date
      });
    });

    corps_.querySelectorAll('[data-act="acheter"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var fid = b.getAttribute('data-id');
        ajouterCourses(fid, quantiteRecette(r, fid), 'recette : ' + r.name);
        var bloc = b.closest('[data-bloc]');
        if (bloc) bloc.outerHTML = '<div class="puce puce-ok" style="display:inline-block;margin:6px 0">✔️ ' +
          esc(nomAliment(fid)) + ' ajouté à la liste de courses</div>';
        toast('Ajouté à la liste de courses');
      });
    });

    corps_.querySelectorAll('[data-act="eviter"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var fid = b.getAttribute('data-id');
        etat.prefs[fid] = { statut: 'eviter', at: aujourdhui(), nbTests: 0 };
        sauver();
        toast(nomAliment(fid) + ' ne sera plus proposé');
        fermerModale();
        rafraichir();
      });
    });

    corps_.querySelector('[data-act="cuisiner"]').addEventListener('click', function () {
      consommerRecette(r);
    });
    var btnModif = corps_.querySelector('[data-act="modifier-recette"]');
    if (btnModif) {
      btnModif.addEventListener('click', function () {
        var perso = trouverRecettePerso(r.id);
        if (perso) editerRecette(perso);
      });
    }
    corps_.querySelector('[data-act="tout-acheter"]').addEventListener('click', function () {
      var n = 0;
      analyserRecette(r).manquants.forEach(function (i) {
        ajouterCourses(i.id, i.q, 'recette : ' + r.name); n++;
      });
      toast(n ? n + ' ingrédient(s) en courses' : 'Tu as déjà tout !');
    });
  }

  function quantiteRecette(r, fid) {
    var i = (r.ing || []).filter(function (x) { return x.id === fid; })[0];
    return i ? i.q : 100;
  }

  /** Déduit les ingrédients d'une recette du stock. */
  function consommerRecette(r) {
    var stock = totalStock();
    var utilise = 0;
    r.ing.forEach(function (i) {
      if ((stock[i.id] || 0) <= 0) return;
      var restant = i.q;
      for (var k = etat.stock.length - 1; k >= 0 && restant > 0; k--) {
        var l = etat.stock[k];
        if (l.foodId !== i.id) continue;
        if (l.qty <= restant) {
          restant -= l.qty;
          etat.stock.splice(k, 1);
          utilise++;
        } else {
          l.qty -= restant;
          restant = 0;
          utilise++;
        }
      }
    });
    sauver();
    fermerModale();
    rafraichir();
    toast(utilise ? 'Stock mis à jour pour ' + r.name : 'Rien n’a été retiré du stock');
  }

  /* =============================================== À GOÛTER (1× / mois) */

  function decouverteDue() {
    var d = etat.decouverte;
    if (d.courante) return false;
    if (!d.derniere) return true;
    var ecoules = -joursRestants(d.derniere);
    return ecoules >= etat.reglages.intervalleJours;
  }

  /** Recettes contenant un aliment donné, les plus légères d'abord. */
  function recettesAvec(foodId) {
    return toutesRecettes()
      .filter(function (r) {
        if (kcalParPortion(r) >= etat.reglages.kcalMax) return false;
        return r.ing.some(function (i) { return i.id === foodId; });
      })
      .sort(function (a, b) { return kcalParPortion(a) - kcalParPortion(b); });
  }

  function candidatsDecouverte() {
    var stock = totalStock();
    // 1. d'abord ce qui est noté « à retester »
    var aRetester = Object.keys(etat.prefs).filter(function (fid) {
      return etat.prefs[fid].statut === 'retester';
    });
    if (aRetester.length) {
      return { foodId: aRetester[0], retest: true };
    }
    // 2. sinon un aliment jamais goûté, pas déjà en stock
    var pool = CATALOGUE.filter(function (a) {
      if (statutDe(a.id)) return false;                      // déjà jugé
      if (['sel', 'poivre', 'eau', 'cafe', 'the'].indexOf(a.id) >= 0) return false;
      if (a.cat === 'condiments' || a.cat === 'boissons') return false;
      if ((stock[a.id] || 0) > 0) return false;              // déjà chez toi
      return recettesAvec(a.id).length > 0;                  // doitrent dans une recette
    });
    if (!pool.length) return null;

    // Écarter ce qui vient d'être proposé (variété)
    var vus = {};
    (etat.decouverte.historique || []).forEach(function (h) { vus[h.foodId] = true; });
    var frais = pool.filter(function (a) { return !vus[a.id]; });
    return { foodId: (frais.length ? frais : pool)[0].id, retest: false };
  }

  function proposerDecouverte() {
    var c = candidatsDecouverte();
    if (!c) return false;
    var rs = recettesAvec(c.foodId);
    etat.decouverte.courante = {
      foodId: c.foodId,
      recipeId: rs.length ? rs[0].id : null,
      retest: c.retest,
      demandee: aujourdhui()
    };
    sauver();
    // ajouté d'office à la liste de courses
    ajouterCourses(c.foodId, 150, 'à goûter ce mois-ci');
    return true;
  }

  function cloturerDecouverte(statut) {
    var d = etat.decouverte.courante;
    if (!d) return;
    var fid = d.foodId;
    var p = etat.prefs[fid] || { nbTests: 0 };
    p.at = aujourdhui();

    if (statut === 'retester') {
      p.nbTests = (p.nbTests || 0) + 1;
      if (p.nbTests >= 2) {
        // déjà représenté deux fois sans avis : on ne repropose plus
        p.statut = 'neutre';
      } else {
        p.statut = 'retester';
      }
    } else {
      p.statut = statut;
      p.nbTests = (p.nbTests || 0) + 1;
    }
    etat.prefs[fid] = p;

    etat.decouverte.historique = (etat.decouverte.historique || []).concat([{
      foodId: fid, statut: statut, at: aujourdhui()
    }]);
    etat.decouverte.courante = null;
    etat.decouverte.derniere = aujourdhui();

    // si on n'aime pas, on retire de la liste de courses
    if (statut === 'pas_aime') {
      etat.courses = etat.courses.filter(function (c) { return c.foodId !== fid; });
    }
    sauver();
  }

  function rendreDecouverte() {
    var ens = el('decouverte-content');
    var badge = el('tab-badge-decouverte');
    var d = etat.decouverte.courante;

    if (d) {
      badge.hidden = false; badge.textContent = '1';
      var a = aliment(d.foodId);
      var r = d.recipeId ? toutesRecettes().filter(function (x) { return x.id === d.recipeId; })[0] : null;
      var kcal = r ? Math.round(kcalParPortion(r)) : null;
      ens.innerHTML =
        '<div class="carte" style="background:linear-gradient(135deg,#fff8e1,#fff);border-left:5px solid var(--orange)">' +
          '<div class="jump" style="background:transparent;border:0;padding:0 0 10px 0;color:var(--orange)">' +
            (d.retest ? '🔁 À retester : tu avais dit ne pas savoir.' : '🧪 Nouvel aliment à goûter ce mois-ci') +
          '</div>' +
          '<h3 style="font-size:1.15rem">' + esc(a.name) + '</h3>' +
          '<p style="margin:6px 0 12px">Inclus dans un repas : ' +
            (r ? '<strong>' + esc(r.name) + '</strong>' : 'à trouver') +
            (kcal ? ' — <span class="puce puce-kcal">' + kcal + ' kcal</span>' : '') + '</p>' +
          '<div class="row-actions">' +
            '<button class="btn btn-ghost" data-act="voir-recette-decouverte">Voir le repas</button>' +
            '<button class="btn btn-primary" data-act="deja-goûte">Je l’ai goûté</button>' +
          '</div>' +
        '</div>' +
        '<div class="carte"><h3>Comment ça marche</h3>' +
          '<p>Une fois par mois, MonStock te propose un aliment que tu n’as jamais goûté, ' +
          'et l’ajoute à ta liste de courses. Tu le manges dans un repas, puis tu donnes ton avis. ' +
          'Si tu réponds « je ne sais pas », l’aliment te sera reproposé une autre fois.</p></div>';

      ens.querySelector('[data-act="voir-recette-decouverte"]').addEventListener('click', function () {
        if (d.recipeId) ouvrirRecette(d.recipeId);
      });
      ens.querySelector('[data-act="deja-goûte"]').addEventListener('click', function () {
        ouvrirModale('Alors, ‘' + a.name + '’ ?',
          '<p style="margin:0 0 14px;font-size:.92rem;color:var(--gris)">' +
          'Tu l’as mangé dans un repas. Tu en as pensé quoi ?</p>' +
          '<div class="choix-3">' +
            '<button class="btn btn-primary" data-verdict="aime">😋 J’ai aimé</button>' +
            '<button class="btn btn-danger" data-verdict="pas_aime">😖 Je n’ai pas aimé</button>' +
            '<button class="btn btn-ghost" data-verdict="retester">🤷 Je ne sais pas</button>' +
          '</div>');
        el('modal-body').querySelectorAll('[data-verdict]').forEach(function (b) {
          b.addEventListener('click', function () {
            var v = b.getAttribute('data-verdict');
            cloturerDecouverte(v);
            fermerModale();

            if (v === 'retester') {
              // « je ne sais pas » : cet aliment sera reproposé plus tard
              rafraichir();
              toast('On te le reproposera au prochain mois');
            } else {
              // Le goût est noté : cet aliment est désormais « connu ».
              // On en propose immédiatement un autre, comme demandé.
              var suivant = proposerDecouverte();
              rafraichir();
              toast(suivant
                ? (v === 'aime' ? 'Noté ! Nouvel aliment proposé' : 'Noté ! Autre aliment proposé')
                : (v === 'aime' ? 'Noté : tu aimes' : 'Noté : tu n’aimes pas'));
            }
          });
        });
      });
      return;
    }

    badge.hidden = true;
    var reste = decompteJoursProchaine();
    ens.innerHTML =
      '<div class="carte">' +
        '<h3>🧪 Une découverte par mois</h3>' +
        '<p style="margin-top:6px">' +
          (reste > 0
            ? 'Prochaine proposition dans <strong>' + reste + ' jour(s)</strong>.'
            : 'Une proposition t’attend…') + '</p>' +
        (reste <= 0 ? '<div class="row-actions" style="margin-top:12px">' +
          '<button class="btn btn-primary" data-act="proposer-maintenant">Proposer un aliment maintenant</button>' +
          '</div>' : '') +
      '</div>' +
      '<div class="carte"><h3>Historique</h3>' +
        (etat.decouverte.historique.length
          ? '<div style="margin-top:8px">' + etat.decouverte.historique.slice().reverse().map(function (h) {
              var a = aliment(h.foodId);
              var ico = h.statut === 'aime' ? '😋' : (h.statut === 'pas_aime' ? '😖' : '🤷');
              var txt = h.statut === 'aime' ? 'aimé' : (h.statut === 'pas_aime' ? 'pas aimé' : 'à retester');
              return '<div class="etail-ingr"><span>' + ico + '</span>' +
                '<span class="nom">' + esc(a ? a.name : h.foodId) + '</span>' +
                '<span class="qte">' + txt + ' · ' + formaterDate(h.at) + '</span></div>';
            }).join('') + '</div>'
          : '<p style="margin-top:6px">Aucune découverte pour l’instant.</p>') +
      '</div>';

    var b = ens.querySelector('[data-act="proposer-maintenant"]');
    if (b) b.addEventListener('click', function () {
      if (proposerDecouverte()) { rafraichir(); toast('Nouvel aliment proposé'); }
      else toast('Plus rien de nouveau à proposer');
    });
  }

  function decompteJoursProchaine() {
    if (!etat.decouverte.derniere) return 0;
    var ecoules = -joursRestants(etat.decouverte.derniere);
    return Math.max(0, etat.reglages.intervalleJours - ecoules);
  }

  /* ==================================================== GOÛTS (préférences) */

  var LIBELLES = {
    aime: { txt: 'Tu aimes', puce: 'puce-ok', ico: '😋' },
    pas_aime: { txt: 'Tu n’aimes pas', puce: 'puce-expire', ico: '😖' },
    retester: { txt: 'À retester', puce: 'puce-violet', ico: '🤷' },
    eviter: { txt: 'À éviter', puce: 'puce-neutre', ico: '🚫' },
    neutre: { txt: 'Goûté 2× sans avis', puce: 'puce-neutre', ico: '➖' }
  };

  function rendreGouts() {
    var ens = el('gouts-content');
    var groupes = ['aime', 'retester', 'pas_aime', 'eviter', 'neutre'];
    var html = '';

    groupes.forEach(function (g) {
      var ids = Object.keys(etat.prefs).filter(function (fid) {
        return etat.prefs[fid].statut === g;
      });
      if (!ids.length) return;
      html += '<div class="carte"><h3>' + LIBELLES[g].ico + ' ' + LIBELLES[g].txt +
        ' <span class="puce puce-neutre">' + ids.length + '</span></h3>';
      ids.forEach(function (fid) {
        var a = aliment(fid);
        var p = etat.prefs[fid];
        var ds = plusUrgentDe(fid);
        html += '<div class="etail-ingr">' +
          '<span class="nom">' + esc(a ? a.name : fid) +
            (ds !== null && ds <= 2 ? ' <span class="puce puce-expire">à finir</span>' : '') + '</span>' +
          '<span class="qte">' + formaterDate(p.at) + '</span>' +
          '<div style="display:flex;gap:5px">' +
            (g !== 'aime' ? '<button class="btn btn-ghost" data-act="pref-aime" data-id="' + fid + '" style="padding:6px 9px;font-size:.75rem">😋</button>' : '') +
            (g !== 'pas_aime' ? '<button class="btn btn-danger" data-act="pref-pas" data-id="' + fid + '" style="padding:6px 9px;font-size:.75rem">😖</button>' : '') +
            (g !== 'retester' ? '<button class="btn btn-ghost" data-act="pref-retester" data-id="' + fid + '" style="padding:6px 9px;font-size:.75rem">🤷</button>' : '') +
            '<button class="btn btn-ghost" data-act="pref-oubli" data-id="' + fid + '" style="padding:6px 9px;font-size:.75rem">✕</button>' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
    });

    if (!html) {
      html = '<div class="vide"><span class="grand">💚</span>' +
        'Aucun goût enregistré pour l’instant.<br>' +
        'Goûte un aliment du commerce et réponds à la proposition mensuelle.</div>';
    }
    ens.innerHTML = html;

    ens.querySelectorAll('[data-act^="pref-"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var fid = b.getAttribute('data-id');
        var act = b.getAttribute('data-act');
        if (act === 'pref-oubli') delete etat.prefs[fid];
        else if (act === 'pref-aime') etat.prefs[fid] = { statut: 'aime', at: aujourdhui(), nbTests: 1 };
        else if (act === 'pref-pas') etat.prefs[fid] = { statut: 'pas_aime', at: aujourdhui(), nbTests: 1 };
        else etat.prefs[fid] = { statut: 'retester', at: aujourdhui(), nbTests: 1 };
        sauver();
        rafraichir();
      });
    });
  }

  /* ================================================= LISTE DE COURSES */

  function ajouterCourses(foodId, qte, origine) {
    var ex = etat.courses.filter(function (c) { return c.foodId === foodId && !c.fait; })[0];
    if (ex) {
      ex.qty = (Number(ex.qty) || 0) + (Number(qte) || 0);
      ex.origine = origine || ex.origine;
    } else {
      etat.courses.push({
        cid: uid('c'), foodId: foodId, qty: Number(qte) || 100,
        fait: false, origine: origine || 'manuel', at: aujourdhui()
      });
    }
    sauver();
    majBadgeCourses();
  }

  function majBadgeCourses() {
    var n = etat.courses.filter(function (c) { return !c.fait; }).length;
    var b = el('tab-badge-courses');
    b.hidden = n === 0;
    b.textContent = n > 9 ? '9+' : String(n);
  }

  function rendreCourses() {
    var ens = el('shopping-list');
    majBadgeCourses();
    if (!etat.courses.length) {
      ens.innerHTML = '<div class="vide"><span class="grand">🛒</span>Liste de courses vide.<br>' +
        'Les ingrédients manquants des recettes et l’aliment à goûter apparaissent ici tout seuls.</div>';
      return;
    }
    var ordre = etat.courses.slice().sort(function (a, b) {
      if (!!a.fait !== !!b.fait) return a.fait ? 1 : -1;
      var ca = aliment(a.foodId), cb = aliment(b.foodId);
      var na = NOMS_CAT[ca ? ca.cat : ''] || 'zzz';
      var nb = NOMS_CAT[cb ? cb.cat : ''] || 'zzz';
      if (na !== nb) return na < nb ? -1 : 1;
      return (ca ? ca.name : '').localeCompare(cb ? cb.name : '');
    });

    ens.innerHTML = ordre.map(function (c) {
      var a = aliment(c.foodId);
      return '<div class="item-course' + (c.fait ? ' faite' : '') + '">' +
        '<input type="checkbox" data-cid="' + c.cid + '"' + (c.fait ? ' checked' : '') + '>' +
        '<div class="libelle">' + esc(a ? a.name : c.foodId) +
          ' <span style="color:var(--gris)">· ' + fmtQte(c.qty) + ' ' + esc(a ? a.unit : 'g') + '</span>' +
          '<div class="source">' + esc(c.origine || '') + '</div>' +
        '</div>' +
        '<button class="icon-btn" style="background:var(--gris-clair);color:var(--texte)" ' +
          'data-act="supprimer-course" data-cid="' + c.cid + '" aria-label="Supprimer">✕</button>' +
      '</div>';
    }).join('');

    ens.querySelectorAll('[data-cid]').forEach(function (n) {
      if (n.tagName === 'INPUT') {
        n.addEventListener('change', function () {
          var c = etat.courses.filter(function (x) { return x.cid === n.getAttribute('data-cid'); })[0];
          if (c) { c.fait = n.checked; sauver(); rendreCourses(); }
        });
      }
    });
    ens.querySelectorAll('[data-act="supprimer-course"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var cid = b.getAttribute('data-cid');
        etat.courses = etat.courses.filter(function (c) { return c.cid !== cid; });
        sauver();
        rendreCourses();
      });
    });
  }

  /* ================================================== RÉGLAGES / SAUVEGARDE */

  function ouvrirReglages() {
    ouvrirModale('Réglages',
      '<div class="champ"><label for="r-kcal">Plafond de calories par portion</label>' +
        '<input id="r-kcal" type="number" min="200" max="900" step="10" value="' + etat.reglages.kcalMax + '">' +
        '<div class="aide">Les propositions au-dessus de ce seuil sont masquées.</div></div>' +
      '<div class="champ"><label for="r-jours">Fréquence de la découverte (jours)</label>' +
        '<input id="r-jours" type="number" min="7" max="90" step="1" value="' + etat.reglages.intervalleJours + '">' +
        '<div class="aide">Par défaut 30 jours, soit une fois par mois.</div></div>' +
      '<button class="btn btn-primary btn-block" id="r-valider">Enregistrer</button>' +
      '<hr style="border:0;border-top:1px solid var(--bord);margin:18px 0">' +
      '<h3 style="margin:0 0 8px;font-size:.95rem">Sauvegarde</h3>' +
      '<p style="font-size:.85rem;color:var(--gris);margin:0 0 12px">' +
        'Tes données sont uniquement dans ce téléphone. Exporte-les pour les transférer.</p>' +
      '<div class="actions-manquant">' +
        '<button class="btn btn-ghost" id="r-export">Exporter (fichier)</button>' +
        '<button class="btn btn-ghost" id="r-import">Importer</button>' +
        '<button class="btn btn-danger" id="r-reset">Tout effacer</button>' +
      '</div>' +
      '<input type="file" id="r-fichier" accept="application/json" hidden>');

    el('r-valider').addEventListener('click', function () {
      etat.reglages.kcalMax = Math.min(900, Math.max(200, Number(el('r-kcal').value) || 500));
      etat.reglages.intervalleJours = Math.min(90, Math.max(7, Number(el('r-jours').value) || 30));
      sauver();
      fermerModale();
      rafraichir();
      toast('Réglages enregistrés');
    });

    el('r-export').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(etat, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'monstock-' + aujourdhui() + '.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      toast('Fichier exporté');
    });

    el('r-import').addEventListener('click', function () { el('r-fichier').click(); });
    el('r-fichier').addEventListener('change', function (ev) {
      var f = ev.target.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          etat = fusionner(etatVierge(), JSON.parse(fr.result));
          sauver();
          fermerModale();
          rafraichir();
          toast('Données importées');
        } catch (e) { toast('Fichier illisible'); }
      };
      fr.readAsText(f);
    });

    el('r-reset').addEventListener('click', function () {
      if (!confirm('Effacer tout : stock, goûts, courses et découverte ?')) return;
      etat = etatVierge();
      sauver();
      fermerModale();
      rafraichir();
      toast('Données effacées');
    });
  }

  /* ====================================================== NAVIGATION */

  var TITRES = {
    stock: 'Mon stock', recettes: 'Recettes', decouverte: 'À goûter',
    goûts: 'Mes goûts', courses: 'Liste de courses'
  };
  var ecranCourant = 'stock';

  function aller(ecran) {
    ecranCourant = ecran;
    Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (s) {
      s.classList.toggle('is-active', s.id === 'screen-' + ecran);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-screen') === ecran);
    });
    el('screen-title').textContent = TITRES[ecran];
    // on relit les données : un ingrédient peut avoir été ajouté à la liste
    // de courses ou au stock depuis une autre fiche
    rafraichir();
    window.scrollTo(0, 0);
  }

  function rafraichir() {
    rendreStock();
    rendreRecettes();
    rendreDecouverte();
    rendreGouts();
    rendreCourses();
    if (decouverteDue()) {
      if (proposerDecouverte()) rendreDecouverte();
    }
  }

  /* ========================================================== DÉMARRAGE */

  function init() {
    charger();
    chargerComposition();

    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () { aller(t.getAttribute('data-screen')); });
    });
    el('btn-menu').addEventListener('click', ouvrirReglages);
    el('modal-close').addEventListener('click', fermerModale);
    el('modal-backdrop').addEventListener('click', function (e) {
      if (e.target === el('modal-backdrop')) fermerModale();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modaleOuverte) fermerModale();
    });

    el('btn-add-food').addEventListener('click', function () { modaleAjoutAliment(null); });
    el('btn-mange').addEventListener('click', function () { modaleConsommer(null, '', 0); });

    el('stock-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var sid = b.getAttribute('data-sid');
      var i = etat.stock.findIndex(function (l) { return l.sid === sid; });
      if (i < 0) return;
      if (b.getAttribute('data-act') === 'retirer') {
        var nom = nomAliment(etat.stock[i].foodId);
        etat.stock.splice(i, 1);
        sauver(); rafraichir(); toast(nom + ' retiré');
      } else if (b.getAttribute('data-act') === 'manger') {
        var ligne = etat.stock[i];
        modaleConsommer(ligne.foodId, nomAliment(ligne.foodId), ligne.qty);
      } else if (b.getAttribute('data-act') === 'ajuster') {
        modaleAjoutAliment(JSON.parse(JSON.stringify(etat.stock[i])));
        // édition : on supprime l'entrée d'origine à la validation
        var idx = i;
        var titre = el('modal-title');
        titre.textContent = 'Modifier l’aliment';
        var valider = el('m-valider');
        valider.addEventListener('click', function () {
          setTimeout(function () {
            var garde = etat.stock.findIndex(function (l) { return l.sid === sid; });
            if (garde >= 0) etat.stock.splice(garde, 1);
            sauver(); rafraichir();
          }, 0);
        });
      }
    });

    el('btn-add-shop').addEventListener('click', function () {
      ouvrirModale('Ajouter aux courses',
        '<div class="champ"><label for="c-recherche">Article</label>' +
          '<input id="c-recherche" type="search" placeholder="Rechercher…" autocomplete="off">' +
          '<div class="suggestions" id="c-suggestions"></div></div>' +
        '<div id="c-choisi"></div>' +
        '<div id="c-champs" hidden>' +
          '<div class="champ"><label for="c-qte">Quantité (g ou ml)</label>' +
            '<input id="c-qte" type="number" inputmode="numeric" min="1" value="200"></div>' +
          '<button class="btn btn-primary btn-block" id="c-valider">Ajouter</button>' +
        '</div>');
      var sel = null;
      function liste(t) {
        var q = String(t || '').toLowerCase();
        var res = CATALOGUE.filter(function (a) {
          return !q || a.name.toLowerCase().indexOf(q) >= 0;
        }).slice(0, 50);
        el('c-suggestions').innerHTML = res.map(function (a) {
          return '<div class="suggestion" data-food="' + a.id + '"><span>' + esc(a.name) + '</span>' +
            '<span class="kcal-mini">' + a.kcal + ' kcal</span></div>';
        }).join('');
        el('c-suggestions').querySelectorAll('[data-food]').forEach(function (n) {
          n.addEventListener('click', function () {
            sel = n.getAttribute('data-food');
            el('c-recherche').value = nomAliment(sel);
            el('c-champs').hidden = false;
            el('c-choisi').innerHTML = '';
          });
        });
      }
      liste('');
      el('c-recherche').addEventListener('input', function () { liste(el('c-recherche').value); });
      el('c-valider').addEventListener('click', function () {
        if (!sel) { toast('Choisis un article'); return; }
        ajouterCourses(sel, Number(el('c-qte').value) || 100, 'manuel');
        fermerModale(); rafraichir(); toast('Ajouté aux courses');
      });
    });

    el('btn-clear-shop').addEventListener('click', function () {
      etat.courses = etat.courses.filter(function (c) { return !c.fait; });
      sauver(); rafraichir(); toast('Articles cochés retirés');
    });

    // La découverte mensuelle peut devenir due même appli fermée :
    // on réévalue au retour sur l'appli.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && modaleOuverte === null) rafraichir();
    });

    rafraichir();

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sans effet */ });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();