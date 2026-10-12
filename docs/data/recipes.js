/* Base de recettes — toutes < 500 kcal par portion.
 * ing : [{ id: <id du catalogue>, q: quantité en g (ou ml) }]
 * serv: nombre de portions
 * Les kcal sont calculés à partir du catalogue (voir app.js) et contrôlés par scripts/validate.py
 */
window.MS_RECIPES = [
  // ============================================================ VOLAILLE
  {
    id: 'poulet_courgette_riz', name: 'Poulet sauté aux courgettes', cat: 'volaille',
    meal: 'plat',
    desc: 'Rapide et léger, parfait pour utiliser des courgettes un peu molles.', time: 20, serv: 1,
    ing: [
      { id: 'poulet_cru', q: 150 }, { id: 'courgette', q: 200 }, { id: 'oignon', q: 50 },
      { id: 'huile_olive', q: 8 }, { id: 'riz', q: 130 }
    ],
    steps: [
      'Couper le poulet en morceaux, l’éleverer la courgette et l’oignon.',
      'Faire saisir le poulet à l’huile 4 min sans remuer.',
      'Ajouter les légumes, couvrir et laisser cuire 8 min.',
      'Servir avec le riz chaud.'
    ]
  },
  {
    id: 'poulet_curry_legumes', name: 'Poulet au curry de légumes', cat: 'volaille',
    meal: 'plat',
    desc: 'Un curry de légumes parfumé, relevé et fondant.', time: 30, serv: 2,
    ing: [
      { id: 'poulet_cru', q: 200 }, { id: 'carotte', q: 200 }, { id: 'poivron', q: 150 },
      { id: 'oignon', q: 100 }, { id: 'courge', q: 200 }, { id: 'curry', q: 8 },
      { id: 'huile_olive', q: 8 }, { id: 'riz', q: 250 }, { id: 'yaourt', q: 100 }
    ],
    steps: [
      'Émincer tous les légumes.',
      'Faire revenir l’oignon puis ajouter les autres légumes 8 min.',
      'Ajouter le curry, le poulet et 200 ml d’eau. Couvrir 12 min.',
      'Servir sur le riz, avec une cuillerée de yaourt.'
    ]
  },
  {
    id: 'poulet_poireaux_quinoa', name: 'Poulet aux poireaux et quinoa', cat: 'volaille',
    meal: 'plat',
    desc: 'Les poireaux fondants épongent le gras du poulet.', time: 30, serv: 2,
    ing: [
      { id: 'poulet_cru', q: 250 }, { id: 'poireaux', q: 250 }, { id: 'quinoa', q: 200 },
      { id: 'carotte', q: 100 }, { id: 'beurre', q: 10 }, { id: 'sel', q: 3 }, { id: 'poivre', q: 1 }
    ],
    steps: [
      'Laver puis Emincer les poireaux.',
      'Fondre le beurre etrissoler les poireaux 10 min.',
      'Ajouter le poulet doré, puis le quinoa et 250 ml d’eau.',
      'Cuire 12 min à feu doux. Saler, poivrer.'
    ]
  },
  {
    id: 'poulet_farci_tomates', name: 'Poulet farci aux tomates', cat: 'volaille',
    meal: 'plat',
    desc: 'Un plat unique qui sent le thym.', time: 45, serv: 2,
    ing: [
      { id: 'poulet_cru', q: 300 }, { id: 'tomate', q: 400 }, { id: 'oignon', q: 100 },
      { id: 'herbes', q: 10 }, { id: 'huile_olive', q: 10 }, { id: 'semoule', q: 200 }
    ],
    steps: [
      'Préchauffer le four à 190 °C.',
      'Faire revenir les oignons, ajouter les tomates écartées 10 min.',
      'Placer le poulet dessus, parsemer d’herbes et d’huile.',
      'Enfourner 30 min. Servir avec la semoule en grains.'
    ]
  },
  {
    id: 'poulet_salade_adobe', name: 'Salade de poulet crudités', cat: 'volaille',
    meal: 'plat',
    desc: 'La recette la plus fraîche pour vider un bac à légumes.', time: 15, serv: 1,
    ing: [
      { id: 'poulet_blanc', q: 150 }, { id: 'tomate', q: 100 }, { id: 'concombre', q: 100 },
      { id: 'salade', q: 50 }, { id: 'huile_olive', q: 8 }, { id: 'moutarde', q: 10 }
    ],
    steps: [
      'Émincer le poulet cuit et tous les légumes.',
      'Mélanger dans un saladier.',
      'Assaisonner avec une vinaigrette moutarde-huile.',
      'Servir tel quel, ou avec une tranche de pain.'
    ]
  },
  {
    id: 'dinde_carottes_patates', name: 'Dinde rôtie aux carottes', cat: 'volaille',
    meal: 'plat',
    desc: 'Four familial, très peu de matière grasse ajoutée.', time: 60, serv: 3,
    ing: [
      { id: 'dinde', q: 350 }, { id: 'carotte', q: 400 }, { id: 'pomme_de_terre', q: 400 },
      { id: 'oignon', q: 100 }, { id: 'huile_olive', q: 12 }
    ],
    steps: [
      'Préchauffer le four à 190 °C.',
      'Émincer carottes, pommes de terre et oignons.',
      'Enrober d’huile, saler, puis ajouter le morceau de dinde.',
      'Enfourner 45 min en arrosant à mi-cuisson.'
    ]
  },
  {
    id: 'dinde_facon_paella', name: 'Dinde façon paella', cat: 'volaille',
    meal: 'plat',
    desc: 'Un seul wok, tout y passe.', time: 35, serv: 2,
    ing: [
      { id: 'dinde', q: 250 }, { id: 'riz', q: 200 }, { id: 'poivron', q: 150 },
      { id: 'petit_pois', q: 100 }, { id: 'oignon', q: 100 }, { id: 'paprika', q: 5 },
      { id: 'huile_olive', q: 12 }
    ],
    steps: [
      'Faire revenir l’oignon, puis la dinde.',
      'Ajouter le riz, le paprika et 350 ml d’eau bouillante.',
      'Couvrir 18 min sans lever le couvercle.',
      'Répartir les poivrons et les petits pois sur le dessus, 5 min de plus.'
    ]
  },

  // ============================================================ POISSON & FRUITS DE MER
  {
    id: 'cabillaud_poireaux', name: 'Cabillaud en brochettes de poireaux', cat: 'poisson',
    meal: 'plat',
    desc: 'Cuisson en brochettes, très douce.', time: 25, serv: 1,
    ing: [
      { id: 'cabillaud', q: 180 }, { id: 'poireaux', q: 200 }, { id: 'beurre', q: 10 },
      { id: 'pomme_de_terre', q: 200 }, { id: 'sel', q: 2 }, { id: 'poivre', q: 1 }
    ],
    steps: [
      'Tailler le cabillaud en cubes et laver les poireaux.',
      'Enrouler les morceaux de poisson dans une feuille de poireau.',
      'Cuire à la vapeur 10 min, puis nappper de beurre fondu.',
      'Servir avec les pommes de terre vapeur.'
    ]
  },
  {
    id: 'colin_brocoli', name: 'Colin pané et brocoli vapeur', cat: 'poisson',
    meal: 'plat',
    desc: 'Le brocoli vert vif se mange à la vapeur douce.', time: 20, serv: 1,
    ing: [
      { id: 'colin', q: 180 }, { id: 'brocoli', q: 200 }, { id: 'farine', q: 40 },
      { id: 'huile', q: 8 }, { id: 'citron', q: 30 }
    ],
    steps: [
      'Fariner le colin et le poêlé 4 min à l’huile.',
      'Ajouter un fond d’eau et couvrir 4 min.',
      'Cuire le brocoli à la vapeur 6 min.',
      'Servir avec un quartier de citron.'
    ]
  },
  {
    id: 'saumon_avocat_salade', name: 'Salade saumon, avocat, agrumes', cat: 'poisson',
    meal: 'plat',
    desc: 'Fraîche, riche en oméga-3, prête en 10 min.', time: 10, serv: 1,
    ing: [
      { id: 'saumon', q: 120 }, { id: 'avocat', q: 60 }, { id: 'orange', q: 100 },
      { id: 'salade', q: 60 }, { id: 'huile_olive', q: 6 }
    ],
    steps: [
      'Poêler le saumon 2 min à la peau puis 1 min de l’autre côté.',
      'Écaler et couper l’avocat.',
      'Dresser la salade, ajouter le saumon émietté et les agrumes.',
      'Arraser d’huile d’olive.'
    ]
  },
  {
    id: 'thon_tomates_toast', name: 'Toast thon et tomates cerises', cat: 'poisson',
    meal: 'plat',
    desc: 'Le déjeuner de secours quand le frigo est vide.', time: 10, serv: 1,
    ing: [
      { id: 'thon', q: 120 }, { id: 'tomate', q: 150 }, { id: 'pain', q: 60 },
      { id: 'salade', q: 30 }, { id: 'moutarde', q: 5 }
    ],
    steps: [
      'Couper les tomates.',
      'Mélanger le thon à la moutarde.',
      'Tartiner le pain, ajouter le thon et les tomates.',
      'Servir avec quelques feuilles de salade.'
    ]
  },
  {
    id: 'crevette_nouilles', name: 'Crevettes sautées aux légumes', cat: 'poisson',
    meal: 'plat',
    desc: 'Un plat express, la recette du sud.', time: 18, serv: 1,
    ing: [
      { id: 'crevette', q: 150 }, { id: 'pates', q: 150 }, { id: 'poivron', q: 80 },
      { id: 'oignon', q: 60 }, { id: 'huile_olive', q: 8 }, { id: 'ail', q: 5 }
    ],
    steps: [
      'Faire cuire les pâtes 9 min.',
      'Saisir l’oignon et l’ail à l’huile.',
      'Ajouter le poivron 4 min puis les crevettes 3 min.',
      'Mélanger avec les pâtes égouttées.'
    ]
  },
  {
    id: 'poisson_gratin_courgette', name: 'Colin en gratin de courgettes', cat: 'poisson',
    meal: 'plat',
    desc: 'Le plat du confort, allégé.', time: 40, serv: 2,
    ing: [
      { id: 'colin', q: 300 }, { id: 'courgette', q: 400 }, { id: 'pomme_de_terre', q: 250 },
      { id: 'lait', q: 150 }, { id: 'comte', q: 60 }, { id: 'beurre', q: 10 }
    ],
    steps: [
      'Préchauffer le four à 190 °C.',
      'Étager les pommes de terre, les courgettes et le poisson dans un plat.',
      'Napper d’une béchamel au lait. Parsemer de comté.',
      'Enfourner 25 min.'
    ]
  },
  {
    id: 'cabillaud_salsa_mangue', name: 'Cabillaud et salsa de mangue', cat: 'poisson',
    meal: 'plat',
    desc: 'Un peu d’exotisme pour parfumer le poisson.', time: 25, serv: 2,
    ing: [
      { id: 'cabillaud', q: 300 }, { id: 'mangue', q: 150 }, { id: 'oignon', q: 80 },
      { id: 'citron', q: 40 }, { id: 'huile_olive', q: 10 }, { id: 'riz', q: 150 }
    ],
    steps: [
      'Mélanger la mangue, l’oignon et le jus de citron.',
      'Cuire le cabillaud au four 15 min à 200 °C, sur son lit de salsa.',
      'Servir avec le riz.'
    ]
  },
  {
    id: 'colin_legumes_poeles', name: 'Colin et légumes poêlés', cat: 'poisson',
    meal: 'plat',
    desc: 'Wok rapide, légumes croquants.', time: 20, serv: 1,
    ing: [
      { id: 'colin', q: 180 }, { id: 'haricot_vert', q: 150 }, { id: 'carotte', q: 100 },
      { id: 'courgette', q: 150 }, { id: 'huile_olive', q: 10 }, { id: 'sauce_soja', q: 15 }
    ],
    steps: [
      'Couper tous les légumes en bâtonnets.',
      'Les saisir à feu vif 6 min en commençant par les plus durs.',
      'Ajouter le poisson et la sauce soja, 3 min.',
      'Servir immédiatement.'
    ]
  },
  {
    id: 'maquereaux_pomme_terre', name: 'Maquereaux et pommes de terre', cat: 'poisson',
    meal: 'plat',
    desc: 'Oméga-3 à prix doux, très rapide.', time: 20, serv: 1,
    ing: [
      { id: 'maquereaux', q: 100 }, { id: 'pomme_de_terre', q: 200 }, { id: 'oignon', q: 60 },
      { id: 'huile_olive', q: 8 }, { id: 'citron', q: 30 }
    ],
    steps: [
      'Poêler les maquereaux 3 min par face.',
      'Faire rissoler les pommes de terre et l’oignon.',
      'Servir avec le citron.'
    ]
  },
  {
    id: 'poisson_bouillon_legumes', name: 'Bouillon de poisson aux légumes', cat: 'poisson',
    meal: 'plat',
    desc: 'Réhydratant, très peu de calories.', time: 15, serv: 1,
    ing: [
      { id: 'thon', q: 100 }, { id: 'bouillon', q: 300 }, { id: 'carotte', q: 100 },
      { id: 'celeri', q: 80 }, { id: 'persil', q: 5 }
    ],
    steps: [
      'Faire revenir les légumes 5 min.',
      'Ajouter le bouillon, leave le frémir 5 min.',
      'Ajouter le thon émietté et les herbes.',
      'Servir.'
    ]
  },

  // ============================================================ ŒUFS
  {
    id: 'omelette_jambon', name: 'Omelette jambon et fromage', cat: 'oeufs',
    meal: 'plat',
    desc: 'Le classique du soir, 3 min de cuisson.', time: 10, serv: 1,
    ing: [
      { id: 'oeuf', q: 150 }, { id: 'jambon', q: 50 }, { id: 'fromage_blanc', q: 40 },
      { id: 'herbes', q: 5 }, { id: 'beurre', q: 10 }
    ],
    steps: [
      'Battre les œufs, les assaisonner.',
      'Cuire à feu doux en remuant avec le jambon.',
      'Ajouter le fromage blanc hors du feu.',
      'Servir avec les herbes.'
    ]
  },
  {
    id: 'oeufs_brouilles_tomates', name: 'Œufs brouillés aux tomates', cat: 'oeufs',
    meal: 'plat',
    desc: 'À faire avec des tomates un peu mûres.', time: 15, serv: 1,
    ing: [
      { id: 'oeuf', q: 150 }, { id: 'tomate', q: 250 }, { id: 'pain', q: 50 },
      { id: 'beurre', q: 10 }, { id: 'herbes', q: 5 }
    ],
    steps: [
      'Faire fondre les tomates à la beurre 8 min.',
      'Ajouter les œufs battus et brouiller.',
      'Servir sur une tranche de pain complet.'
    ]
  },
  {
    id: 'shakshuka', name: 'Shakshuka', cat: 'oeufs',
    meal: 'plat',
    desc: 'Œufs pochés dans une sauce tomate épicée.', time: 25, serv: 2,
    ing: [
      { id: 'oeuf', q: 200 }, { id: 'tomate', q: 400 }, { id: 'poivron', q: 150 },
      { id: 'oignon', q: 100 }, { id: 'cumin', q: 4 }, { id: 'paprika', q: 4 },
      { id: 'huile_olive', q: 12 }
    ],
    steps: [
      'Faire revenir l’oignon et les poivrons 8 min.',
      'Ajouter les tomates, le cumin et le paprika. Couvrir 10 min.',
      'Creuser 4 cratères et y déposer les œufs. Couvrir 6 min.',
      'Servir bien chaud.'
    ]
  },
  {
    id: 'oeufs_plat_brocoli', name: 'Œufs au plat et brocoli', cat: 'oeufs',
    meal: 'plat',
    desc: 'La recette la plus maigre de la base.', time: 15, serv: 1,
    ing: [
      { id: 'oeuf', q: 120 }, { id: 'brocoli', q: 200 }, { id: 'huile_olive', q: 6 },
      { id: 'sel', q: 2 }, { id: 'poivre', q: 1 }
    ],
    steps: [
      'Cuire le brocoli à la vapeur 6 min.',
      'Cuire les œufs au plat 4 min.',
      'Assaisonner et servir ensemble.'
    ]
  },
  {
    id: 'pain_perdu', name: 'Pain perdu au lait', cat: 'oeufs',
    meal: 'plat',
    desc: 'Une bonne façon de sauver du pain rassis.', time: 15, serv: 1,
    ing: [
      { id: 'pain', q: 70 }, { id: 'oeuf', q: 100 }, { id: 'lait', q: 100 },
      { id: 'sucre', q: 10 }, { id: 'beurre', q: 8 }
    ],
    steps: [
      'Mélanger l’œuf, le lait et le sucre.',
      'Tremper les tranches de pain.',
      'Poêler à la beurre 3 min par face.',
      'Servir tiède.'
    ]
  },
  {
    id: 'creme_oeuf', name: 'Œufs en cocotte', cat: 'oeufs',
    meal: 'plat',
    desc: 'Moelleux et prêt en 12 min.', time: 12, serv: 1,
    ing: [
      { id: 'oeuf', q: 150 }, { id: 'creme', q: 60 }, { id: 'comte', q: 25 },
      { id: 'sel', q: 2 }, { id: 'poivre', q: 1 }
    ],
    steps: [
      'Chauffer la crème et casser les œufs dedans.',
      'Enfourner au bain-marie 9 min à 90 °C.',
      'Parsemer de comté et servir.'
    ]
  },

  // ============================================================ LÉGUMINEUSES & VÉGÉTARIEN
  {
    id: 'lentilles_courgette_feta', name: 'Lentilles, courgette, feta', cat: 'legumineuses',
    meal: 'plat',
    desc: 'Un plat unique et complet, parfait tiède.', time: 30, serv: 2,
    ing: [
      { id: 'lentilles', q: 300 }, { id: 'courgette', q: 300 }, { id: 'feta', q: 80 },
      { id: 'oignon', q: 100 }, { id: 'huile_olive', q: 12 }, { id: 'cumin', q: 4 }
    ],
    steps: [
      'Faire revenir l’oignon dans l’huile 5 min.',
      'Ajouter les lentilles et 300 ml d’eau. Couvrir 20 min.',
      'Ajouter la courgette 5 min.',
      'Parsemer de feta émiettée.'
    ]
  },
  {
    id: 'pois_chiches_brocoli', name: 'Pois chiches et brocoli', cat: 'legumineuses',
    meal: 'plat',
    desc: 'Protéines végétales, très rassasiant.', time: 20, serv: 1,
    ing: [
      { id: 'pois_chiches', q: 120 }, { id: 'brocoli', q: 150 }, { id: 'riz', q: 100 },
      { id: 'huile_olive', q: 8 }, { id: 'cumin', q: 4 }
    ],
    steps: [
      'Réchauffer les pois chiches avec le cumin 5 min.',
      'Ajouter le brocoli et 150 ml d’eau, 6 min.',
      'Servir sur le riz.'
    ]
  },
  {
    id: 'haricots_rouges_facon_chili', name: 'Haricots rouges façon chili', cat: 'legumineuses',
    meal: 'plat',
    desc: 'Un chili sans viande, très goûteux.', time: 30, serv: 3,
    ing: [
      { id: 'haricots_rouges', q: 400 }, { id: 'tomate', q: 500 }, { id: 'oignon', q: 150 },
      { id: 'poivron', q: 200 }, { id: 'paprika', q: 6 }, { id: 'huile_olive', q: 14 }
    ],
    steps: [
      'Faire revenir l’oignon et le poivron 10 min.',
      'Ajouter les tomates et les épices, laisser réduire 10 min.',
      'Ajouter les haricots et réchauffer 10 min.',
      'Servir bien chaud.'
    ]
  },
  {
    id: 'soupe_lentilles', name: 'Velouté de lentilles et carottes', cat: 'legumineuses',
    meal: 'entree',
    desc: 'Très peu de calories, très réparateur.', time: 35, serv: 4,
    ing: [
      { id: 'lentilles_seches', q: 200 }, { id: 'carotte', q: 400 }, { id: 'oignon', q: 150 },
      { id: 'pomme_de_terre', q: 300 }, { id: 'bouillon', q: 1200 }, { id: 'huile_olive', q: 10 }
    ],
    steps: [
      'Émincer les légumes et les faire revenir à l’huile.',
      'Ajouter les lentilles, la pomme de terre et le bouillon.',
      'Cuire 30 min puis mixer finement.',
      'Rectifier l’assaisonnement.'
    ]
  },
  {
    id: 'galette_avoine', name: 'Galettes d’avoine', cat: 'legumineuses',
    meal: 'plat',
    desc: 'À servir avec du yaourt ou un œuf.', time: 15, serv: 2,
    ing: [
      { id: 'flocons_avoine', q: 120 }, { id: 'oeuf', q: 100 }, { id: 'banane', q: 100 },
      { id: 'pomme', q: 80 }
    ],
    steps: [
      'Mixer tous les ingrédients.',
      'Cuire des petites galettes 3 min de chaque côté.',
      'Servir avec du yaourt.'
    ]
  },
  {
    id: 'porridge_avoine', name: 'Porridge avoine et fruits', cat: 'legumineuses',
    meal: 'plat',
    desc: 'Le petit-déjeuner le plus rassasiant.', time: 8, serv: 1,
    ing: [
      { id: 'flocons_avoine', q: 45 }, { id: 'lait', q: 150 }, { id: 'banane', q: 100 },
      { id: 'myrtille', q: 50 }, { id: 'amande', q: 10 }
    ],
    steps: [
      'Chauffer le lait et les flocons 5 min en remuant.',
      'Ajouter les fruits coupés.',
      'Parsemer d’amandes concassées.'
    ]
  },
  {
    id: 'bol_grec', name: 'Bol grec maison', cat: 'legumineuses',
    meal: 'plat',
    desc: 'Aucune cuisson, prêt en 5 min.', time: 5, serv: 1,
    ing: [
      { id: 'yaourt_grec', q: 170 }, { id: 'fruit_rouge_mixte', q: 100 },
      { id: 'fraise', q: 80 }, { id: 'amande', q: 20 }, { id: 'miel', q: 15 }
    ],
    steps: [
      'Dans un bocal, alternate yaourt et fruits.',
      'Ajoute les amandes et le miel.',
      'Mélange juste avant de manger.'
    ]
  },

  // ============================================================ CÉRÉALES
  {
    id: 'buddha_bowl_quinoa', name: 'Bowl quinoa, légumes, avocat', cat: 'cereales',
    meal: 'plat',
    desc: 'Le repas « meal prep » par excellence.', time: 25, serv: 2,
    ing: [
      { id: 'quinoa', q: 160 }, { id: 'avocat', q: 120 }, { id: 'brocoli', q: 150 },
      { id: 'carotte', q: 150 }, { id: 'pois_chiches', q: 150 }, { id: 'huile_olive', q: 10 },
      { id: 'sauce_soja', q: 20 }
    ],
    steps: [
      'Cuire le quinoa 15 min.',
      'Rôtir brocoli, carottes et pois chiches 15 min à 200 °C.',
      'Écraser l’avocat et dressez avec le quinoa.',
      'Assaisonner d’huile et de sauce soja.'
    ]
  },
  {
    id: 'risotto_champignons', name: 'Risotto aux champignons', cat: 'cereales',
    meal: 'plat',
    desc: 'Crémeux sans matière grasse ajoutée.', time: 30, serv: 2,
    ing: [
      { id: 'riz', q: 200 }, { id: 'champignon', q: 250 }, { id: 'oignon', q: 100 },
      { id: 'bouillon', q: 600 }, { id: 'parmesan', q: 20 }, { id: 'huile_olive', q: 12 }
    ],
    steps: [
      'Saisir les champignons 5 min, réserver.',
      'Faire revenir l’oignon et le riz 2 min.',
      'Ajouter le bouillon petit à petit 18 min en remuant.',
      'Incorporer les champignons et le parmesan hors du feu.'
    ]
  },
  {
    id: 'nouilles_champignons', name: 'Pâtes aux champignons', cat: 'cereales',
    meal: 'plat',
    desc: 'Prêt en 15 min avec des champignons.', time: 15, serv: 2,
    ing: [
      { id: 'pates', q: 250 }, { id: 'champignon', q: 300 }, { id: 'oignon', q: 100 },
      { id: 'ail', q: 10 }, { id: 'huile_olive', q: 12 }, { id: 'parmesan', q: 20 }
    ],
    steps: [
      'Cuire les pâtes 9 min.',
      'Saisir l’oignon et l’ail, ajouter les champignons 8 min.',
      'Mélanger avec les pâtes.',
      'Parsemer de parmesan.'
    ]
  },
  {
    id: 'riz_saute_legumes', name: 'Riz sauté aux légumes', cat: 'cereales',
    meal: 'plat',
    desc: 'Une façon économique de vider le bac à légumes.', time: 15, serv: 2,
    ing: [
      { id: 'riz', q: 300 }, { id: 'carotte', q: 150 }, { id: 'haricot_vert', q: 150 },
      { id: 'petit_pois', q: 100 }, { id: 'oeuf', q: 150 }, { id: 'huile_olive', q: 12 },
      { id: 'sauce_soja', q: 20 }
    ],
    steps: [
      'Égoutter le riz, ou le préparer à l’avance.',
      'Saisir les légumes 8 min à feu vif.',
      'Ajouter le riz, l’œuf et la sauce soja.',
      'Mélanger à la spatule 3 min.'
    ]
  },

  // ============================================================ BŒUF
  {
    id: 'steak_hache_tomate', name: 'Steak haché tomates et oignons', cat: 'boeuf',
    meal: 'plat',
    desc: 'Le plat du quotidien, très rassasiant.', time: 20, serv: 1,
    ing: [
      { id: 'boeuf_hache', q: 150 }, { id: 'tomate', q: 200 }, { id: 'oignon', q: 80 },
      { id: 'huile_olive', q: 6 }, { id: 'pomme_de_terre', q: 150 }
    ],
    steps: [
      'Faire saisir le steak 4 min.',
      'Émincer les oignons et tomates, les cuire 8 min.',
      'Servir avec les pommes de terre vapeur.'
    ]
  },
  {
    id: 'boeuf_wok', name: 'Bœuf sauté façon wok', cat: 'boeuf',
    meal: 'plat',
    desc: 'Rapide, parfumé et peu calorique.', time: 20, serv: 2,
    ing: [
      { id: 'boeuf_boeuf', q: 240 }, { id: 'poivron', q: 200 }, { id: 'courgette', q: 150 },
      { id: 'riz', q: 250 }, { id: 'sauce_soja', q: 20 }, { id: 'huile_sesame', q: 6 },
      { id: 'ail', q: 10 }
    ],
    steps: [
      'Saisir le bœuf en tranches 3 min, réserver.',
      'Sauter les légumes 5 min à feu vif.',
      'Ajouter l’ail et la sauce soja.',
      'Servir sur le riz.'
    ]
  },
  {
    id: 'entrecote_poireaux', name: 'Entrecôte aux poireaux', cat: 'boeuf',
    meal: 'plat',
    desc: 'Gras mais savoureux, pour un jour sans contrainte.', time: 25, serv: 2,
    ing: [
      { id: 'entrecote', q: 220 }, { id: 'poireaux', q: 300 }, { id: 'pomme_de_terre', q: 250 },
      { id: 'beurre', q: 15 }
    ],
    steps: [
      'Cuire les poireaux à la vapeur 10 min.',
      'Griller l’entrecôte 3 min par face.',
      'Servir avec les pommes de terre et le beurre.'
    ]
  },

  // ============================================================ GRATINS & FOUR
  {
    id: 'gratin_courgette', name: 'Gratin de courgettes', cat: 'four',
    meal: 'plat',
    desc: 'Très peu de calories, très rassasiant.', time: 45, serv: 3,
    ing: [
      { id: 'courgette', q: 800 }, { id: 'oignon', q: 100 }, { id: 'lait', q: 200 },
      { id: 'comte', g: 0, q: 90 }, { id: 'oeuf', q: 100 }, { id: 'huile_olive', q: 12 }
    ],
    steps: [
      'Préchauffer le four à 190 °C.',
      'Faire transpirer les courgettes 10 min à l’huile.',
      'Ajouter l’oignon, le lait et l’œuf battus.',
      'Enfourner 30 min avec le comté.'
    ]
  },
  {
    id: 'tian_provencal', name: 'Tian provençal', cat: 'four',
    meal: 'plat',
    desc: 'Des couches de légumes, très coloré.', time: 50, serv: 3,
    ing: [
      { id: 'tomate', q: 500 }, { id: 'courgette', q: 400 }, { id: 'poivron', q: 300 },
      { id: 'oeuf', q: 250 }, { id: 'huile_olive', q: 18 }, { id: 'herbes', q: 10 }
    ],
    steps: [
      'Préchauffer le four à 190 °C.',
      'Superposer les légumes en tranches dans un plat huilé.',
      'Enfourner 30 min pour attendrir les légumes.',
      'Casser les œufs sur le dessus, 8 min de plus.'
    ]
  },
  {
    id: 'pommes_de_terre_four', name: 'Pommes de terre rôties au four', cat: 'four',
    meal: 'plat',
    desc: 'Base simple d’un repas complet.', time: 45, serv: 3,
    ing: [
      { id: 'pomme_de_terre', q: 700 }, { id: 'oignon_rouge', q: 100 },
      { id: 'huile_olive', q: 15 }, { id: 'romarin', q: 5 }
    ],
    steps: [
      'Préchauffer le four à 200 °C.',
      'Couper les pommes de terre en quartiers.',
      'Mélanger avec l’huile, l’oignon et le romarin.',
      'Enfourner 40 min.'
    ]
  },
  {
    id: 'legumes_raties_four', name: 'Légumes rôtis du jardin', cat: 'four',
    meal: 'plat',
    desc: 'Simplement bons et très simples.', time: 40, serv: 3,
    ing: [
      { id: 'courgette', q: 300 }, { id: 'poivron', q: 300 }, { id: 'patate_douce', q: 400 },
      { id: 'oignon_rouge', q: 150 }, { id: 'huile_olive', q: 20 }, { id: 'herbes', q: 10 }
    ],
    steps: [
      'Préchauffer le four à 200 °C.',
      'Couper tous les légumes en morceaux.',
      'Arroser d’huile et d’herbes.',
      'Enfourner 35 min en remuant à mi-cuisson.'
    ]
  },
  {
    id: 'poivrons_farcis', name: 'Poivrons farcis', cat: 'four',
    meal: 'plat',
    desc: 'Beau look, et beaucoup de légumes.', time: 55, serv: 3,
    ing: [
      { id: 'poivron', q: 600 }, { id: 'riz', q: 200 }, { id: 'tomate', q: 400 },
      { id: 'oignon', q: 150 }, { id: 'fromage_blanc', q: 100 }, { id: 'huile_olive', q: 16 }
    ],
    steps: [
      'Préchauffer le four à 190 °C.',
      'Faire revenir les oignons et tomates 10 min, ajouter le riz et 200 ml d’eau.',
      'Cuire 12 min puis farcir les poivrons.',
      'Enfourner 30 min, ajouter le fromage blanc 5 min avant la fin.'
    ]
  },

  // ============================================================ SALADES & BOUILLON
  {
    id: 'salade_verte_pois_chiches', name: 'Salade verte et pois chiches', cat: 'salade',
    meal: 'plat',
    desc: 'Très légère, idéale le soir.', time: 10, serv: 1,
    ing: [
      { id: 'salade', q: 80 }, { id: 'pois_chiches', q: 150 }, { id: 'concombre', q: 100 },
      { id: 'tomate', q: 100 }, { id: 'huile_olive', q: 8 }, { id: 'moutarde', q: 5 }
    ],
    steps: [
      'Laver et égoutter la salade.',
      'Mélanger tous les ingrédients dans un saladier.',
      'Assaisonner.'
    ]
  },
  {
    id: 'salade_chiens', name: 'Salade de lentilles et feta', cat: 'salade',
    meal: 'entree',
    desc: 'Féculents + protéines, la recette qui tient.', time: 15, serv: 1,
    ing: [
      { id: 'lentilles', q: 180 }, { id: 'feta', q: 40 }, { id: 'oignon_rouge', q: 40 },
      { id: 'salade', q: 60 }, { id: 'huile_olive', q: 10 }
    ],
    steps: [
      'Émincer l’oignon rouge très fin.',
      'Mélanger les lentilles, la salade et l’oignon.',
      'Ajouter la feta émiettée et l’huile.'
    ]
  },
  {
    id: 'bouillon_legumes_maison', name: 'Bouillon de légumes maison', cat: 'salade',
    meal: 'entree',
    desc: 'Zéro calorie, à boire tiède.', time: 25, serv: 4,
    ing: [
      { id: 'carotte', q: 200 }, { id: 'poireaux', q: 150 }, { id: 'oignon', q: 100 },
      { id: 'celeri', q: 100 }, { id: 'persil', q: 10 }, { id: 'sel', q: 3 }
    ],
    steps: [
      'Émincer tous les légumes.',
      'Faire revenir 5 min sans matière grasse.',
      'Ajouter 2 L d’eau et laisser frémir 20 min.',
      'Saler, ajouter le persil.'
    ]
  },
  {
    id: 'salade_comte', name: 'Salade de pommes de terre et comté', cat: 'salade',
    meal: 'plat',
    desc: 'Un reste de repas bien construit.', time: 15, serv: 2,
    ing: [
      { id: 'pomme_de_terre', q: 400 }, { id: 'comte', q: 60 }, { id: 'salade', q: 100 },
      { id: 'tomate', q: 150 }, { id: 'huile_olive', q: 12 }, { id: 'moutarde', q: 8 }
    ],
    steps: [
      'Faire cuire les pommes de terre et refroidir.',
      'Émincer les légumes.',
      'Mélanger avec le comté en copeaux et la vinaigrette.'
    ]
  },

  // ============================================================ DESSERTS LÉGERS
  {
    id: 'yaourt_fruits', name: 'Yaourt aux fruits', cat: 'dessert',
    meal: 'dessert',
    desc: 'Le dessert le plus simple.', time: 3, serv: 1,
    ing: [
      { id: 'yaourt', q: 150 }, { id: 'fraise', q: 100 }, { id: 'miel', q: 10 }
    ],
    steps: [
      'Couper les fruits.',
      'Mélanger avec le yaourt et le miel.'
    ]
  },
  {
    id: 'mousse_chocolat', name: 'Mousse au chocolat noir', cat: 'dessert',
    meal: 'dessert',
    desc: 'Deux ingrédients, très chocolaté.', time: 10, serv: 2,
    ing: [
      { id: 'chocolat_noir', q: 80 }, { id: 'oeuf', q: 100 }, { id: 'sucre', q: 40 }
    ],
    steps: [
      'Faire fondre le chocolat.',
      'Séparer les blancs et les monter en neige avec le sucre.',
      'Mélanger le jaune puis incorporer les blancs.',
      'Réfrigérer 2 h minimum.'
    ]
  },
  {
    id: 'salade_fruits', name: 'Salade de fruits', cat: 'dessert',
    meal: 'dessert',
    desc: 'Zéro cuisine, zéro calories ajoutées.', time: 3, serv: 1,
    ing: [
      { id: 'orange', q: 150 }, { id: 'pomme', q: 150 }, { id: 'kiwi', q: 100 },
      { id: 'banane', q: 100 }
    ],
    steps: [
      'Écaler et couper tous les fruits.',
      'Mélanger dans un bowl.'
    ]
  },
  {
    id: 'chips_banane', name: 'Bananes rôties', cat: 'dessert',
    meal: 'dessert',
    desc: 'Un dessert chaud très léger.', time: 20, serv: 2,
    ing: [
      { id: 'banane', q: 300 }, { id: 'miel', q: 20 }, { id: 'amande', q: 20 }
    ],
    steps: [
      'Couper les bananes en deux.',
      'Enfourner 18 min à 180 °C avec le miel.',
      'Parsemer d’amandes concassées.'
    ]
  },

  /* ==================================================================
     COMPOSANTS DE REPAS
     Un repas = une entrée + un plat + (un fromage) + (un dessert),
     le tout devant faire environ 500 kcal.
     `meal` indique la place du plat dans le repas.
     ================================================================== */

  // ------------------------------------------------------------ ENTRÉES
  {
    id: 'ent_salade_tomates', name: 'Salade de tomates', cat: 'salade', meal: 'entree',
    desc: 'L’entrée d’été la plus simple.', time: 10, serv: 1,
    ing: [
      { id: 'tomate', q: 250 }, { id: 'concombre', q: 100 },
      { id: 'oignon', q: 30 }, { id: 'huile_olive', q: 8 }
    ],
    steps: [
      'Couper les tomates et le concombre.',
      'Émincer l’oignon très fin.',
      'Assaisonner à l’huile d’olive.'
    ]
  },
  {
    id: 'ent_veloute_courge', name: 'Velouté de courge', cat: 'salade', meal: 'entree',
    desc: 'Reconfortant et très léger.', time: 25, serv: 1,
    ing: [
      { id: 'courge', q: 400 }, { id: 'pomme_de_terre', q: 100 },
      { id: 'oignon', q: 60 }, { id: 'creme', q: 30 }
    ],
    steps: [
      'Faire revenir l’oignon 5 min.',
      'Ajouter la courge et la pomme de terre avec 400 ml d’eau.',
      'Cuire 20 min puis mixer, ajouter la crème.'
    ]
  },
  {
    id: 'ent_salade_verte', name: 'Salade verte assaisonnée', cat: 'salade', meal: 'entree',
    desc: 'Presque rien, mais indispensable.', time: 5, serv: 1,
    ing: [
      { id: 'salade', q: 100 }, { id: 'tomate', q: 100 },
      { id: 'concombre', q: 80 }, { id: 'huile_olive', q: 6 }
    ],
    steps: ['Laver la salade.', 'Couper les légumes.', 'Assaisonner.']
  },
  {
    id: 'ent_oeufs_durs', name: 'Œufs durs à la vinaigrette', cat: 'oeufs', meal: 'entree',
    desc: 'Rapide, proteiné, zéro cuisson.', time: 12, serv: 1,
    ing: [
      { id: 'oeuf', q: 120 }, { id: 'salade', q: 50 },
      { id: 'moutarde', q: 10 }, { id: 'huile_olive', q: 8 }
    ],
    steps: [
      'Cuire les œufs 9 min et les refroidir.',
      'Écaler et couper en deux.',
      'Servir sur salade avec une vinaigrette moutarde.'
    ]
  },
  {
    id: 'ent_chevre_miel', name: 'Tartine chèvre-miel', cat: 'four', meal: 'entree',
    desc: 'Classique de bar, très efficace.', time: 8, serv: 1,
    ing: [
      { id: 'chevre', q: 40 }, { id: 'miel', q: 15 },
      { id: 'pain', q: 40 }, { id: 'salade', q: 40 }
    ],
    steps: [
      'Toaster légèrement le pain.',
      'Tartiner de chèvre, ajouter le miel.',
      'Servir avec quelques feuilles de salade.'
    ]
  },
  {
    id: 'ent_soupe_poireaux', name: 'Velouté de poireaux', cat: 'salade', meal: 'entree',
    desc: 'Doux, idéal quand les poireaux traînent.', time: 30, serv: 1,
    ing: [
      { id: 'poireaux', q: 250 }, { id: 'pomme_de_terre', q: 120 },
      { id: 'oignon', q: 50 }, { id: 'creme', q: 30 }
    ],
    steps: [
      'Émincer les poireaux et l’oignon, les faire revenir 8 min.',
      'Ajouter la pomme de terre et 400 ml d’eau.',
      'Cuire 20 min, mixer, crémer.'
    ]
  },
  {
    id: 'ent_salade_lentilles', name: 'Salade de lentilles et feta', cat: 'salade', meal: 'entree',
    desc: 'Protéiné, se prépare à l’avance.', time: 15, serv: 1,
    ing: [
      { id: 'lentilles', q: 180 }, { id: 'feta', q: 40 },
      { id: 'oignon_rouge', q: 40 }, { id: 'huile_olive', q: 10 }
    ],
    steps: [
      'Émincer l’oignon rouge très fin.',
      'Mélanger lentilles, salade et oignon.',
      'Ajouter la feta émiettée et l’huile.'
    ]
  },
  {
    id: 'ent_broccoli_tomates', name: 'Salade de brocoli et tomates', cat: 'salade', meal: 'entree',
    desc: 'Brocoli croquant, tomates mûres.', time: 15, serv: 1,
    ing: [
      { id: 'brocoli', q: 200 }, { id: 'tomate', q: 150 },
      { id: 'huile_olive', q: 8 }, { id: 'moutarde', q: 5 }
    ],
    steps: [
      'Cuire le brocoli 6 min à la vapeur.',
      'Couper les tomates.',
      'Assaisonner à la moutarde et à l’huile.'
    ]
  },

  // ------------------------------------------------------------ FROMAGES
  {
    id: 'from_camembert', name: 'Camembert', cat: 'laitages', meal: 'fromage',
    desc: 'Une portion de 30 g.', time: 1, serv: 1,
    ing: [{ id: 'camembert', q: 30 }],
    steps: ['Une portion, tout simplement.']
  },
  {
    id: 'from_brie', name: 'Brie', cat: 'laitages', meal: 'fromage',
    desc: 'Une portion de 30 g.', time: 1, serv: 1,
    ing: [{ id: 'brie', q: 30 }],
    steps: ['Une portion, tout simplement.']
  },
  {
    id: 'from_comte', name: 'Comté', cat: 'laitages', meal: 'fromage',
    desc: 'Une portion de 25 g.', time: 1, serv: 1,
    ing: [{ id: 'comte', q: 25 }],
    steps: ['Une portion, tout simplement.']
  },
  {
    id: 'from_comte_rape', name: 'Comté râpé', cat: 'laitages', meal: 'fromage',
    desc: 'Une portion de 20 g.', time: 1, serv: 1,
    ing: [{ id: 'comte_rape', q: 20 }],
    steps: ['Une portion, tout simplement.']
  },
  {
    id: 'from_chevre', name: 'Chèvre', cat: 'laitages', meal: 'fromage',
    desc: 'Une portion de 25 g.', time: 1, serv: 1,
    ing: [{ id: 'chevre', q: 25 }],
    steps: ['Une portion, tout simplement.']
  },
  {
    id: 'from_bleu', name: 'Bleu', cat: 'laitages', meal: 'fromage',
    desc: 'Une portion de 25 g.', time: 1, serv: 1,
    ing: [{ id: 'bleu', q: 25 }],
    steps: ['Une portion, tout simplement.']
  },
  {
    id: 'from_mozzarella', name: 'Mozzarella', cat: 'laitages', meal: 'fromage',
    desc: 'Une portion de 30 g.', time: 1, serv: 1,
    ing: [{ id: 'mozzarella', q: 30 }],
    steps: ['Une portion, tout simplement.']
  },
  {
    id: 'from_parmesan', name: 'Parmesan', cat: 'laitages', meal: 'fromage',
    desc: 'Une portion de 15 g, râpé fin.', time: 1, serv: 1,
    ing: [{ id: 'parmesan', q: 15 }],
    steps: ['Une portion, tout simplement.']
  },

  // ------------------------------------------------------------ DESSERTS
  {
    id: 'des_yogourt_fruits_rouges', name: 'Yaourt et fruits rouges', cat: 'dessert', meal: 'dessert',
    desc: 'Le dessert le plus simple, 5 min.', time: 5, serv: 1,
    ing: [
      { id: 'yaourt', q: 150 }, { id: 'fraise', q: 80 },
      { id: 'myrtille', q: 50 }, { id: 'miel', q: 10 }
    ],
    steps: ['Couper les fruits.', 'Mélanger avec le yaourt et le miel.']
  },
  {
    id: 'des_chocolat', name: 'Chocolat noir', cat: 'dessert', meal: 'dessert',
    desc: 'Deux carrés, et c’est tout.', time: 1, serv: 1,
    ing: [{ id: 'chocolat_noir', q: 15 }],
    steps: ['Deux carrés de chocolat noir 70 %.']
  },
  {
    id: 'des_compote', name: 'Compote de pommes', cat: 'dessert', meal: 'dessert',
    desc: 'Maison, en 15 min.', time: 15, serv: 1,
    ing: [
      { id: 'pomme', q: 250 }, { id: 'sucre', q: 20 }, { id: 'citron', q: 10 }
    ],
    steps: [
      'Éplucher et couper les pommes.',
      'Cuire 12 min avec le sucre et un peu de jus de citron.'
    ]
  },
  {
    id: 'des_creme_anglaise', name: 'Crème anglaise', cat: 'dessert', meal: 'dessert',
    desc: 'Un peu d’effort, vraiment très bon.', time: 15, serv: 2,
    ing: [
      { id: 'lait', q: 250 }, { id: 'jaune_oeuf', q: 60 }, { id: 'sucre', q: 40 }
    ],
    steps: [
      'Chauffer le lait.',
      'Blanchir les jaunes avec le sucre, ajouter le lait en filet.',
      'Cuire à feu doux en remuant jusqu’à ébullition, laisser refroidir.'
    ]
  },
  {
    id: 'des_yaourt_grec_miel', name: 'Yaourt grec, miel et amandes', cat: 'dessert', meal: 'dessert',
    desc: 'Gourmand mais léger.', time: 3, serv: 1,
    ing: [
      { id: 'yaourt_grec', q: 150 }, { id: 'miel', q: 15 }, { id: 'amande', q: 15 }
    ],
    steps: ['Verser le yaourt dans un bol.', 'Ajouter le miel et les amandes concassées.']
  },
  {
    id: 'des_fraises_bio', name: 'Fraises et fromage blanc', cat: 'dessert', meal: 'dessert',
    desc: 'Frais, de saison, presque sans calorie.', time: 5, serv: 1,
    ing: [
      { id: 'fraise', q: 150 }, { id: 'fromage_blanc', q: 100 }
    ],
    steps: ['Laver les fraises.', 'Servir avec le fromage blanc.']
  },
  {
    id: 'des_flan', name: 'Flan au caramel', cat: 'dessert', meal: 'dessert',
    desc: 'Régressé et pas cher.', time: 40, serv: 4,
    ing: [
      { id: 'oeuf', q: 150 }, { id: 'lait', q: 500 },
      { id: 'sucre', q: 100 }, { id: 'caramel', q: 80 }
    ],
    steps: [
      'Faire un caramel dans le moule.',
      'Mélanger les œufs, le lait et le sucre, verser sur le caramel.',
      'Cuire au bain-marie 30 min à 150 °C.'
    ]
  },

  /* ==================================================================
     PLATS LÉGERS (250-320 kcal)
     Pensés pour être associés à une entrée, un fromage ou un dessert
     sans dépasser le budget du repas.
     ================================================================== */
  {
    id: 'leg_cabillaud_vapeur', name: 'Cabillaud à la vapeur et riz', cat: 'poisson', meal: 'plat',
    desc: 'La façon la plus légère de manger du poisson.', time: 20, serv: 1,
    ing: [
      { id: 'cabillaud', q: 150 }, { id: 'riz', q: 120 },
      { id: 'citron', q: 20 }, { id: 'huile_olive', q: 5 }
    ],
    steps: [
      'Cuire le riz 12 min.',
      'Plonger le cabillaud 8 min à la vapeur.',
      'Servir avec un filet d’huile et un quartier de citron.'
    ]
  },
  {
    id: 'leg_saumon_haricots', name: 'Saumon et haricots verts', cat: 'poisson', meal: 'plat',
    desc: 'Oméga-3 sans féculent lourd.', time: 20, serv: 1,
    ing: [
      { id: 'saumon', q: 130 }, { id: 'haricot_vert', q: 200 },
      { id: 'huile_olive', q: 8 }, { id: 'citron', q: 20 }
    ],
    steps: [
      'Saisir le saumon 4 min à la peau.',
      'Cuire les haricots 8 min à la vapeur.',
      'Servir avec un filet d’huile et le citron.'
    ]
  },
  {
    id: 'leg_omelette_legumes', name: 'Omelette aux légumes', cat: 'oeufs', meal: 'plat',
    desc: 'Très légère, prête en 10 min.', time: 12, serv: 1,
    ing: [
      { id: 'oeuf', q: 120 }, { id: 'courgette', q: 100 },
      { id: 'oignon', q: 30 }, { id: 'beurre', q: 8 }
    ],
    steps: [
      'Faire revenir les légumes 5 min à la beurre.',
      'Ajouter les œufs battus et laisser prendre.',
      'Servir immédiatement.'
    ]
  },
  {
    id: 'leg_poulet_haricots', name: 'Poulet poêlé et haricots verts', cat: 'volaille', meal: 'plat',
    desc: 'Protéiné et léger.', time: 20, serv: 1,
    ing: [
      { id: 'poulet_cru', q: 150 }, { id: 'haricot_vert', q: 200 },
      { id: 'huile_olive', q: 8 }, { id: 'poivre', q: 1 }
    ],
    steps: ['Saisir le poulet 8 min.', 'Cuire les haricots 8 min à la vapeur.',
      'Assaisonner et servir.']
  },
  {
    id: 'leg_boeuf_haricots', name: 'Bœuf et haricots verts', cat: 'boeuf', meal: 'plat',
    desc: 'Le steak qui laisse de la place.', time: 20, serv: 1,
    ing: [
      { id: 'boeuf_boeuf', q: 150 }, { id: 'haricot_vert', q: 200 },
      { id: 'huile_olive', q: 8 }, { id: 'sel', q: 2 }
    ],
    steps: ['Griller le bœuf 3 min par face.', 'Cuire les haricots 8 min.', 'Servir.']
  },
  {
    id: 'leg_oeufs_plat_pain', name: 'Œufs au plat et pain complet', cat: 'oeufs', meal: 'plat',
    desc: 'Le repas le plus simple du monde.', time: 12, serv: 1,
    ing: [
      { id: 'oeuf', q: 120 }, { id: 'pain', q: 40 },
      { id: 'beurre', q: 8 }, { id: 'sel', q: 2 }
    ],
    steps: ['Cuire les œufs au plat 4 min.', 'Beurrer et toaster le pain.', 'Servir.']
  },
  {
    id: 'leg_crevettes_ris', name: 'Crevettes sautées et riz', cat: 'poisson', meal: 'plat',
    desc: 'Très léger, beaucoup de goût.', time: 18, serv: 1,
    ing: [
      { id: 'crevette', q: 150 }, { id: 'riz', q: 120 },
      { id: 'huile_olive', q: 8 }, { id: 'citron', q: 20 }
    ],
    steps: [
      'Cuire le riz 12 min.',
      'Sauter les crevettes 4 min à l’huile.',
      'Ajouter le citron, servir avec le riz.'
    ]
  },
  {
    id: 'leg_dinde_legumes', name: 'Dinde sautée et légumes poêlés', cat: 'volaille', meal: 'plat',
    desc: 'Sans féculent, très léger.', time: 20, serv: 1,
    ing: [
      { id: 'dinde', q: 130 }, { id: 'courgette', q: 150 },
      { id: 'carotte', q: 80 }, { id: 'huile_olive', q: 8 }
    ],
    steps: [
      'Saisir la dinde 6 min.',
      'Ajouter les légumes 6 min à feu vif.',
      'Assaisonner.'
    ]
  },
  {
    id: 'leg_lentilles_carottes', name: 'Lentilles et carottes', cat: 'legumineuses', meal: 'plat',
    desc: 'Végétarien, économique, rassasiant.', time: 25, serv: 1,
    ing: [
      { id: 'lentilles', q: 200 }, { id: 'carotte', q: 150 },
      { id: 'oignon', q: 50 }, { id: 'huile_olive', q: 8 }
    ],
    steps: [
      'Faire revenir l’oignon 5 min.',
      'Ajouter les lentilles, les carottes et 250 ml d’eau.',
      'Cuire 20 min.'
    ]
  },
  {
    id: 'leg_pois_chiches_legumes', name: 'Pois chiches et légumes', cat: 'legumineuses', meal: 'plat',
    desc: 'Protéines végétales, très léger.', time: 20, serv: 1,
    ing: [
      { id: 'pois_chiches', q: 150 }, { id: 'courgette', q: 150 },
      { id: 'tomate', q: 100 }, { id: 'huile_olive', q: 8 },
      { id: 'cumin', q: 3 }
    ],
    steps: [
      'Réchauffer les pois chiches avec le cumin 5 min.',
      'Ajouter les légumes 8 min.',
      'Assaisonner.'
    ]
  },
  {
    id: 'leg_colin_pommes_terre', name: 'Colin et pommes de terre', cat: 'poisson', meal: 'plat',
    desc: 'Le plat familial du jour de repos.', time: 25, serv: 1,
    ing: [
      { id: 'colin', q: 150 }, { id: 'pomme_de_terre', q: 200 },
      { id: 'beurre', q: 8 }, { id: 'sel', q: 2 }
    ],
    steps: [
      'Cuire les pommes de terre 15 min.',
      'Poêler le colin 5 min à la beurre.',
      'Servir ensemble.'
    ]
  },
  {
    id: 'leg_galette_sucre', name: 'Galettes d’avoine au yaourt', cat: 'legumineuses', meal: 'plat',
    desc: 'Sans viande, très rassasiant.', time: 15, serv: 1,
    ing: [
      { id: 'flocons_avoine', q: 70 }, { id: 'oeuf', q: 60 },
      { id: 'banane', q: 80 }, { id: 'yaourt', q: 100 }
    ],
    steps: [
      'Mixer l’avoine, l’œuf et la banane.',
      'Cuire des galettes 3 min de chaque côté.',
      'Servir avec le yaourt.'
    ]
  },
  {
    id: 'leg_thon_tomates', name: 'Thon, tomates et haricots verts', cat: 'poisson', meal: 'plat',
    desc: 'Sans cuisson, prêt en 10 min.', time: 10, serv: 1,
    ing: [
      { id: 'thon', q: 120 }, { id: 'tomate', q: 150 },
      { id: 'haricot_vert', q: 150 }, { id: 'huile_olive', q: 8 }
    ],
    steps: [
      'Cuire les haricots 8 min.',
      'Émincer les tomates.',
      'Mélanger le tout avec l’huile.'
    ]
  },
  {
    id: 'leg_batonnets_riz', name: 'Bâtonnets de poulet et riz', cat: 'volaille', meal: 'plat',
    desc: 'Très léger, très rapide.', time: 15, serv: 1,
    ing: [
      { id: 'poulet_batonnet', q: 120 }, { id: 'riz', q: 120 },
      { id: 'concombre', q: 100 }, { id: 'huile_olive', q: 5 }
    ],
    steps: [
      'Chauffer les bâtonnets 4 min à la poêle.',
      'Cuire le riz 12 min.',
      'Servir avec le concombre.'
    ]
  }
];