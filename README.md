# ED Privacy Protect

ED Privacy Protect protège votre navigation sur EcoleDirecte en bloquant les requêtes de suivi Matomo et BM Info.

Le dépôt contient deux versions séparées, adaptées à leur navigateur :

- [`firefox/`](firefox/) : version Firefox publiée sur [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/ed-privacy-protect/).
- [`chromium/`](chromium/) : version Manifest V3 pour Arc, Chrome, Edge et Brave.

## Installer sur Firefox

1. Ouvrez la [page officielle ED Privacy Protect sur Firefox Add-ons](https://addons.mozilla.org/fr/firefox/addon/ed-privacy-protect/).
2. Cliquez sur **Ajouter à Firefox** puis confirmez.
3. Les futures mises à jour seront installées automatiquement par Firefox.

## Installer sur Arc, Chrome, Edge ou Brave

1. Téléchargez le dépôt (bouton **Code** > **Download ZIP**) ou clonez-le.
2. Décompressez l'archive si nécessaire.
3. Ouvrez la page des extensions de votre navigateur :
   - Arc : `arc://extensions`
   - Chrome ou Brave : `chrome://extensions`
   - Edge : `edge://extensions`
4. Activez le **mode développeur**.
5. Cliquez sur **Charger l'extension non empaquetée** / **Load unpacked**.
6. Sélectionnez le dossier `chromium` — celui qui contient `manifest.json`.

Cette installation est gratuite : aucun compte développeur du Chrome Web Store n'est requis.

## Respect de la vie privée

Les deux versions limitent leurs permissions aux pages de `*.ecoledirecte.com`. La version Chromium s'appuie sur les règles déclaratives de Manifest V3 et ne peut pas lire les cookies, les corps de requêtes ni les paramètres des URL. Son journal local ne conserve que des métadonnées non sensibles (endpoint, hôte, type, onglet et horaire), avec une limite de 200 entrées.

## Développement

Consultez le README du dossier correspondant : [`firefox/README.md`](firefox/README.md) ou [`chromium/README.md`](chromium/README.md).
