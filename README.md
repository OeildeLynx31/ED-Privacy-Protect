# ED Privacy Protect

Protégez vos données personnelles sur Ecole Directe en bloquant les traqueurs (Matomo, BM Info, etc.).

## Développement

L'extension est compatible avec Firefox et Chrome grâce à un shim (`shim.js`) qui unifie les APIs.

- `npm run dev` : Lancer dans Firefox avec `web-ext`.
- `npm run dev-c` : Lancer dans Chrome avec `web-ext`.
- `npm run http` : Servir les fichiers localement pour tester le HTML/CSS du popup.

## Construction (Build)

- `npm run build` : Génère une archive de l'extension prête à être installée.

## Améliorations récentes

- **Shim d'API unifié** : Meilleure compatibilité entre navigateurs.
- **Optimisation des performances** : Pré-compilation des regex de blocage et rendu optimisé du popup.
- **Sécurité renforcée** : Nettoyage des permissions et échappement des données affichées.
