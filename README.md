# Cornet de route

Le guide des glaciers d'exception, dans le monde entier : un seul palais, le même barème partout.
Site statique sur mesure, généré par un petit programme Node **sans aucune dépendance**.

## Organisation

| Dossier ou fichier | Contenu |
| --- | --- |
| `content/glaciers/*.json` | Une fiche par glacier. Le nom du fichier donne l'adresse de la page. |
| `content/pays/<pays>.json`, `content/villes/<pays>-<ville>.json` | Facultatif : `{ "intro": "…" }` pour un texte d'introduction. |
| `site.config.json` | Nom, adresse du site, seuil de la page ville (3), fond de carte, mesure d'audience. |
| `src/` | Le générateur (`build.mjs`), les modèles de pages (`pages.mjs`) et les composants (`lib.mjs`). |
| `public/` | Copié tel quel : style, scripts, icônes, application installable, espace d'administration. |
| `scripts/icones.mjs` | Régénère les icônes et l'image de partage (nécessite `sharp`). |

## Commandes

```sh
node src/build.mjs            # site de production dans dist/
node src/build.mjs --apercu   # aperçu à liens relatifs dans apercu/
```

Le générateur signale dans la console les fiches incomplètes (coordonnées, récit, verdict manquants).
Une fiche sans distinction ou avec `"publie": false` n'est pas publiée.

## Adresses des pages

- `/fr/` accueil, `/fr/destinations/`, `/fr/carte/`, `/fr/autour-de-moi/`, `/fr/ma-liste/`, `/fr/recherche/`, `/fr/methode/`
- `/fr/<pays>/` page pays, `/fr/<pays>/<ville>/` page ville (à partir de 3 glaciers publiés)
- `/fr/<pays>/<ville>/<glacier>/` fiche glacier

Le préfixe `/fr/` laisse la place à `/en/` pour la version anglaise.

## Mise en ligne sur Cloudflare Pages

1. Créer le dépôt GitHub `cornet-de-route` (privé) et y pousser ce dossier.
2. Cloudflare › Workers & Pages › Créer › Pages › Connecter le dépôt.
3. Réglages de build : commande `node src/build.mjs`, dossier de sortie `dist`, variable `NODE_VERSION` = `22`.
4. Domaines personnalisés : ajouter `cornetderoute.com` (et `www`). Pour `cornetderoute.fr`, une règle de redirection Cloudflare vers `https://cornetderoute.com` (le fichier `_redirects` ne gère pas les domaines).

Chaque commit sur `main`, y compris depuis l'administration, republie le site en une à deux minutes.

## Espace d'administration (`/admin/`)

Sveltia CMS : un formulaire pour ajouter ou modifier un glacier et sa photo, depuis le téléphone ou l'ordinateur.
Chaque enregistrement crée un commit dans le dépôt.

1. Dans `public/admin/config.yml`, remplacer `PROPRIETAIRE/cornet-de-route` par le vrai compte GitHub.
2. Sur GitHub : Settings › Developer settings › Fine-grained tokens › un jeton limité au seul dépôt `cornet-de-route`, permission *Contents : Read and write*.
3. Sur `https://cornetderoute.com/admin/`, choisir la connexion par jeton et coller ce jeton.

Les photos sont converties en WebP et réduites à 1200 × 1500 px avant l'envoi.

## Mesure d'audience

Renseigner `umami.script` et `umami.siteId` dans `site.config.json` une fois Umami installé.
Événements déjà envoyés par le site : `recherche` (destination), `autour-de-moi`, `ajout-liste` (glacier),
`installation-app`, `y-aller` (glacier, enregistré sans figurer au tableau de bord).

## Reste à faire

- Fond de carte définitif : `carte.tuiles` dans `site.config.json` (OpenStreetMap provisoire, réservé à un usage léger).
- Héberger les polices sur le site plutôt que chez Google Fonts.
- Mentions légales : compléter les passages entre crochets.
- Sébastien Gaudard : date de visite, options alimentaires, numéro rue des Pyramides, coordonnées à vérifier.
