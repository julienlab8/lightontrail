# LIGHT ON TRAIL · Trail Pierre-Percée

Site statique (HTML/CSS/JS, pas de build) du Trail Pierre-Percée, organisé par LIGHT ON.
Aperçu local : `python3 -m http.server 8080` à la racine, puis http://localhost:8080.

## Conventions

- Les épreuves s'appellent uniquement **17 KM\***, **37 KM\*\*** et **54 KM\*\*\*** (majuscules + étoiles). Pas de noms inventés (« L'Intégrale », « La Découverte »…).
- Les étoiles indiquent le niveau du format : plus il y en a, plus le format est long. L'événement porte le nombre d'étoiles de son plus grand format : « Pierre-Percée\*\*\* », « PIERRE-PERCÉE\*\*\* 2027 ».
- Ordre d'affichage : du plus petit au plus grand (17 → 37 → 54). Exception : programme et horaires restent chronologiques (le 54 part en premier).
- L'organisateur est **LIGHT ON** (pas « LIGHT ON TRAIL »).
- Ouverture des inscriptions : écrire « 29 septembre - 20h ».
- Le village de l'événement s'appelle **Village LIGHT ON** (pour ne pas le confondre avec le village de Pierre-Percée ou de Celles-sur-Plaine).
- Contact : hello@lightontri.com est volontaire (seule adresse pour le moment).
- Le menu et le pied de page sont dupliqués dans chaque page HTML : toute modification doit être répétée sur toutes les pages.

## DA LIGHT ON (pas encore de charte complète)

- Couleurs : noir `#232323`, orange `#ED5F3E`, blanc `#FFFFFF`. La DA est sombre : le clair n'en fait pas partie.
- Titres : Lemon Milk, bold ou regular selon l'usage, **jamais d'italique**. Textes : Roboto normal, certains mots forts en gras.
- Logos : toujours préférer les versions bicolores (noir/blanc + orange). Le picto (crochets + éclair) est un élément fort de la marque.
- Fichiers source : `~/Documents/Documents/MAZE Planner/LIGHT ON/2 - Light On/DA/` (SVG, PNG, AI).
- Pas de crédit vidéaste à afficher pour les vidéos.

## Direction visuelle du site (refonte du 30/09/2026)

- Style « éditorial sombre » : angles droits, pas de cartes arrondies ni de halos, pas d'animations de fondu au défilement. Blocs séparés par des filets avec un trait orange d'accent.
- Signatures de marque (à utiliser avec parcimonie) : crochets du picto (`.brk`, `.brk-in`), coupe en biais dans l'angle de l'éclair (`.cut`, une fois par page), repères GPS (`.geo`), éclair dans les boutons S'inscrire (`.btn-go`).
- Le double menu (barre d'accès rapide + menu principal) est à conserver tel quel.
- Mettre en orange un mot clé des grands titres avec `<em>` (jamais d'italique).
- Accueil : sections numérotées (`.idx` « 01 », « 02 »…) avec des grands titres de même taille ; « Les courses*** » (`.sec-top.lead`) est le titre le plus fort, les chiffres 17/37/54 sont en contour.
- Sur mobile, varier les mises en page : `.swipe` (cartes qui défilent à l'horizontale), étapes en frise, chiffres incrustés dans les photos. Éviter les longues piles de blocs identiques.
- Témoignages : uniquement de vrais retours de coureurs, cités mot pour mot, avec prénom + initiale et distance (`.v-lead`, `.v-card`, `.q-inline`). Le 54 KM*** est nouveau en 2027 : pas de témoignage.
- Chaque page doit proposer un bouton S'inscrire bien visible ; un seul bouton plein par groupe de boutons.
- Les styles de la refonte sont à la fin de `assets/css/site.css` ; changer le `?v=` des liens CSS/JS après chaque modification.

## Ton rédactionnel LIGHT ON

LIGHT ON crée des événements sportifs outdoor : triathlon, trail, running.

**Ton** : dynamique, sportif, direct et complice, avec une vraie personnalité, sans en faire trop. On s'adresse aux participants comme à une communauté qui partage le goût du sport, de l'effort et du plaisir.

**Principe clé** : du challenge, oui, mais jamais dans un registre guerrier ou ultra-performance. On peut se dépasser sans se prendre trop au sérieux. L'effort, le plaisir, l'expérience et la convivialité vont ensemble.

**Style** :
- court et efficace : phrases simples, rythme naturel, pas de longs discours ;
- complice : clin d'œil, jeu de mots, pointe d'humour légère ;
- moderne et spontané, pas un texte publicitaire d'agence ;
- sportif mais accessible : on parle aux compétiteurs comme à ceux qui viennent se challenger ou simplement profiter ;
- enthousiaste sans être cucul : pas de grandes envolées émotionnelles, de phrases inspirantes convenues ni de vocabulaire lyrique ;
- concret : le terrain, les sensations, les distances, le lieu, le moment vécu.

Sur le site web : garder cette personnalité, un cran plus sobre que sur Instagram. Clair, identifiable, vivant, sans blabla. Pas d'emojis.

**À éviter** : « une aventure humaine inoubliable », « dépassez vos limites », « vibrez au rythme de… », « une expérience unique », « prêts à relever le défi ? », « passionnés de sport », et tout vocabulaire marketing interchangeable. **Ne jamais parler d'« ultra »** (ultra-trail, ultra-distance) : le terme désigne les courses à partir de 80 km, et le 54 KM\*\*\* n'en est pas une. Parler de grand format, de longue sortie, de grosse journée… Pas d'accumulation d'adjectifs ni de superlatifs (« exceptionnel », « incroyable », « incontournable ») : le contenu doit donner envie par lui-même.

**Références** :
- « 17, 37 ou 54 KM : trois façons de découvrir Pierre-Percée. Une seule règle : en profiter. »
- « LIGHT ON — Le goût de l'effort, grandeur nature. »

**Aussi** : pas de tirets longs (— ou –), uniquement « - ». Pas le mot « fête ». Remplacer les promesses (« organisation soignée », « ravitaillements généreux ») par des preuves concrètes : paysage, singles, bénévoles, ravitos, lac, retours de coureurs. Le Lac de Pierre-Percée est « l'un des plus grands lacs de Lorraine » (pas « le plus grand »). Chaque grande section doit contenir au moins une phrase impossible à copier sur le site d'un autre trail. Exemples validés : « Du trail sérieux, sans se prendre au sérieux », « prévoyez le café avant », « Le reste, c'est vos jambes ».

**Test avant chaque texte** : cette phrase pourrait-elle appartenir à n'importe quelle course outdoor ? Si oui, la retravailler. Une bonne phrase LIGHT ON pourrait être dite à voix haute par quelqu'un de l'équipe. Entre plusieurs formulations, choisir la plus courte, la plus naturelle et la moins publicitaire.

Ne jamais modifier les informations pratiques (horaires, distances, dénivelés, ravitaillements, barrières horaires, tarifs) sans validation.

## SEO (mis en place le 30/09/2026)

- Chaque page a un `<title>`, une meta description, une canonical absolue (`https://www.lightontrail.com/...`) et un Open Graph complet : à créer pour toute nouvelle page, et l'ajouter à `sitemap.xml`.
- Le sur-titre de chaque page fait partie du H1 (`<h1><span class="eyebrow page-kicker">…</span> …</h1>`).
- Données structurées JSON-LD : événement 2027 + organisation sur l'accueil, FAQ sur Infos. Les mettre à jour si une date, un horaire, un tarif ou le lieu change. Jamais d'avis/étoiles à partir des témoignages.
- Photos : fichiers au nom descriptif, versions WebP dans `assets/img/webp/` (`nom-640.webp`, `nom-1280.webp`…, générées avec Pillow/libwebp, qualité 74) via `<picture>`, avec `width`/`height`. Toute nouvelle photo suit ce schéma. **Ne pas utiliser l'AVIF de macOS (ImageIO)** : Chrome l'affiche en gris uni.
- Liens vers l'accueil : `./` (pas `index.html`). `404.html` utilise des chemins absolus (`/assets/...`).
- Vidéos : une version légère `-mobile.mp4` (960 px) servie sous 700 px.
- Géographie exacte : départ à Celles-sur-Plaine (Vosges, 88), Base de Loisirs ; lac à cheval sur Vosges et Meurthe-et-Moselle ; Lorraine, Grand Est.

## À transmettre à Julien (message de Magali, 30/09/2026)

Julien, voici ce qui a été fait sur le site pendant que tu n'étais pas là, et ce qu'il reste à faire de ton côté. **Claude : si c'est Julien qui travaille sur le projet, présente-lui ce message en début de session**, puis supprime cette section une fois qu'il l'a lu et que Magali est d'accord.

**Ce qui a été fait (avec Magali)**
- Refonte « éditorial sombre » de tout le site, textes réécrits dans le ton LIGHT ON, témoignages de coureurs 2026, mobile retravaillé.
- Le village s'appelle maintenant « Village LIGHT ON » partout.
- Nouvelles pages : `reglement.html` (règlement 2027), `resultats.html` (classements 2026, puis 2027), `mentions-legales.html`, `404.html`.
- SEO : canonical, titres et descriptions, Open Graph, données structurées (événement 2027 avec les 3 courses, organisation, FAQ), robots.txt, sitemap.xml, redirections dans `.htaccess` (sans www → www, /index.html → /), tableau comparatif des courses, bloc « L'essentiel » sur l'accueil.
- Performance : photos renommées et déclinées en WebP, polices en WOFF2, vidéos allégées pour mobile.
- Épingles : « prévoir 4 épingles à nourrice ou un porte-dossard » (sans « obligatoire »).

**À faire / à confirmer par Julien**
1. Confirmer l'hébergeur Hostinger et « directeur de la publication : Julien Labdant » (page Mentions légales).
2. Vérifier le règlement 2027 (catégorie Espoir sur le 54, années de naissance 2009/2007, dates limites au 1er avril 2027).
3. Envoyer les GPX du 37 KM** et du 54 KM*** ; donner les barrières horaires du 54 dès qu'elles sont fixées.
4. Google Search Console : créer la propriété « domaine » lightontrail.com et y déclarer https://www.lightontrail.com/sitemap.xml.
5. Désactiver GitHub Pages (julienlab8.github.io/lightontrail) s'il ne sert plus : c'est une copie du site.
6. Inscrire la course sur les calendriers : Kikourou, Jogging-International, Trail-Passion, Betrail ; regarder l'éligibilité ITRA du 54.
7. Demander un lien vers le site à l'office de tourisme du Pays des Lacs et aux partenaires.
8. Le 4 avril 2027 au soir : mettre les résultats 2027 sur `resultats.html`. Si les dossards sont épuisés, passer `InStock` à `SoldOut` dans le JSON-LD de `index.html`.
