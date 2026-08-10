# ED Privacy Protect — Chromium

Cette version Manifest V3 est destinée aux navigateurs Chromium (Arc, Chrome, Edge, Brave…). Ses permissions sont limitées à `*.ecoledirecte.com`. Elle bloque les requêtes vers `matomo.php` et `bm_info` uniquement lorsqu'elles sont initiées par EcoleDirecte, sans pouvoir lire les cookies, les corps de requêtes ou les paramètres d'URL.

## Installation locale

1. Téléchargez ou clonez ce dépôt.
2. Dans votre navigateur, ouvrez la page des extensions : `arc://extensions` dans Arc, `chrome://extensions` dans Chrome/Brave ou `edge://extensions` dans Edge.
3. Activez le **mode développeur**.
4. Cliquez sur **Charger l'extension non empaquetée** / **Load unpacked**.
5. Sélectionnez le dossier `chromium` (celui qui contient `manifest.json`).

L'installation locale est gratuite et ne nécessite pas de compte développeur du Chrome Web Store.

## Développement

Depuis ce dossier : `npm install`, puis `npm run dev`, `npm run check` ou `npm run build`.
