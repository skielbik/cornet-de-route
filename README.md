# Cornet de route

Le guide des glaciers d'exception, dans le monde entier : un seul palais, le même barème partout.
Site statique sur mesure, généré par un petit programme Node **sans aucune dépendance**.

## Organisation

| Dossier ou fichier | Contenu |
| --- | --- |
| `content/glaciers/*.json` | Une fiche par glacier. Le nom du fichier donne l'adresse de la page. |
| `content/pays/<pays>.json`, `content/villes/<pays>-<ville>.json` | Facultatif : `{ "intro": "…" }` pour un texte d'introduction. |
| `site.config.json` | Nom, adresse du site, seuil de la page ville (3), fond de carte (OpenFreeMap + MapLibre 5.23.0), mesure d'audience. |
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

## Mise en ligne sur Cloudflare

Le site est un Worker Cloudflare sans script, qui sert le dossier `dist/` (réglages dans `wrangler.jsonc`).

- Dépôt GitHub : `skielbik/cornet-de-route` (privé), branche `main`.
- Commande de build : `node src/build.mjs`. Variable `NODE_VERSION` = `22`.
- Adresse de test : `https://cornet-de-route.cornetderoute.workers.dev`.
- `version.txt` donne la version en ligne : utile pour vérifier qu'une publication est passée.
- Domaine : `cornetderoute.com` en domaine personnalisé du Worker ; `www.cornetderoute.com` redirigé vers lui par une règle de redirection Cloudflare. Le `.fr` n'est pas utilisé.

Chaque commit sur `main`, y compris depuis l'administration, republie le site en une à deux minutes.

## Espace d'administration (`/admin/`)

Sveltia CMS : un formulaire pour ajouter ou modifier un glacier et sa photo, depuis le téléphone ou l'ordinateur.
Chaque enregistrement crée un commit dans le dépôt.

1. Le dépôt est déclaré dans `public/admin/config.yml` (`skielbik/cornet-de-route`).
2. Sur GitHub : Settings › Developer settings › Fine-grained tokens › un jeton limité au seul dépôt `cornet-de-route`, permission *Contents : Read and write*.
3. Sur `https://cornetderoute.com/admin/`, choisir la connexion par jeton et coller ce jeton.

Les photos sont converties en WebP et réduites à 1200 × 1500 px avant l'envoi.

## Mesure d'audience

Renseigner `umami.script` et `umami.siteId` dans `site.config.json` une fois Umami installé.
Événements déjà envoyés par le site : `recherche` (destination), `autour-de-moi`, `ajout-liste` (glacier),
`installation-app`, `y-aller` (glacier, enregistré sans figurer au tableau de bord).

## Avant le lancement

`"ouvertAuxMoteurs": false` dans `site.config.json` garde tout le site hors de Google (balise noindex et robots.txt fermé).
Le jour du lancement, passer la valeur à `true`, puis déclarer `sitemap.xml` dans la Search Console.

## Reste à faire

- Mentions légales : compléter les passages entre crochets.
- Sébastien Gaudard : date de visite, options alimentaires, numéro rue des Pyramides, coordonnées à vérifier.
