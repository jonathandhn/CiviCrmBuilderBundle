# État du projet et Guide de Build - GrapesJsCustomPluginBundle

Ce document décrit l'état actuel du projet et les étapes nécessaires pour compiler les assets.

## État du Projet

Le projet est un plugin Mautic conçu pour étendre l'éditeur GrapesJS avec des blocs et fonctionnalités personnalisés.

### Composants clés :
- **Framework PHP** : Plugin Mautic (Symfony).
- **Frontend** : TypeScript utilisant `grapesjs-cli` pour la compilation.
- **Localisation des sources** : `Assets/src/index.ts`.
- **Assets compilés** : `Assets/dist/index.js`.
- **Intégration Mautic** : Le plugin est déclaré comme une intégration "Basic" dans Mautic.
- **Version actuelle** : 1.0.47 (définie dans `package.json`).

### Observations techniques :
- Un `AssetsSubscriber` est présent dans `EventSubscriber/AssetsSubscriber.php` pour injecter le fichier JS compilé dans l'interface de Mautic.
- **Note importante** : Actuellement, le service `AssetsSubscriber` n'est pas enregistré dans `Config/config.php`. Pour qu'il soit actif, il doit être ajouté à la section `services -> events`.
- Le plugin utilise `grapesjs-cli` pour gérer le build, ce qui simplifie la configuration Webpack/Babel.

## Comment Build

Le projet utilise npm pour la gestion des dépendances frontend et la compilation.

### Prérequis
- Node.js (version récente recommandée)
- npm

### Étapes de Build

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Compiler le plugin** (Production) :
   ```bash
   npm run build
   ```
   Cette commande génère le fichier `Assets/dist/index.js`.

3. **Mode Développement** (Auto-rebuild) :
   ```bash
   npm run start
   ```

## Structure des Fichiers
- `Assets/src/` : Contient le code source TypeScript du plugin GrapesJS.
- `Assets/dist/` : Contient les fichiers compilés prêts à être servis par Mautic.
- `Config/` : Configuration du plugin Mautic.
- `EventSubscriber/` : Abonnés aux événements Mautic (ex: injection d'assets).
- `Integration/` : Logique d'intégration Mautic.
