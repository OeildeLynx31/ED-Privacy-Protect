# ED Privacy Protect — Firefox

Cette version Firefox (Manifest V2) bloque les traceurs EcoleDirecte (Matomo, BM Info, etc.). Elle est publiée sur le [catalogue officiel Firefox](https://addons.mozilla.org/fr/firefox/addon/ed-privacy-protect/).

## Installation

Installez-la directement depuis [addons.mozilla.org](https://addons.mozilla.org/fr/firefox/addon/ed-privacy-protect/). Firefox gère alors les mises à jour automatiquement.

## Développement

L'extension est compatible avec Firefox et Chrome (bientôt).

- `npm run dev` : Lancer dans Firefox avec `web-ext`.
- `npm run http` : Servir les fichiers localement pour tester le HTML/CSS du popup.

## Construction (Build)

- `npm run build` : Génère une archive de l'extension prête à être installée.
