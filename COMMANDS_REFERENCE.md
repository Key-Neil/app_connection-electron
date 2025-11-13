# 📋 COMMANDES ESSENTIELLES

## Installation & Configuration

```bash
# Installer les dépendances
npm install

# Copier le template .env (optionnel, il existe déjà)
cp .env.example .env

# Générer le client Prisma
npm run prisma:generate
```

## Base de Données

```bash
# Créer les tables (exécute les migrations Prisma)
npm run db:migrate

# Recharger les données initiales
npm run db:seed

# Ouvrir l'interface Prisma Studio (pour visualiser les données)
npx prisma studio

# Ajouter un utilisateur manuellement
npx prisma db execute ./seed.sql
```

## Développement

```bash
# Lancer en mode développement (hot reload)
npm run dev

# Compiler le code TypeScript
npm run build

# Lancer l'app compilée
npm start

# Écouter les changements et recompiler
npx tsc --watch
```

## Qualité du Code

```bash
# Vérifier le code (ESLint)
npm run lint

# Corriger les erreurs ESLint
npx eslint src --fix

# Formater le code (Prettier)
npm run format

# Vérifier la formatting
npx prettier --check src
```

## Build & Packaging

```bash
# Compiler tout
npm run build

# Créer l'executable installable
npm run package

# Créer uniquement pour Windows
npm run package -- --win

# Créer pour macOS
npm run package -- --mac

# Créer pour Linux
npm run package -- --linux
```

## Prisma (Base de Données)

```bash
# Créer une nouvelle migration
npm run db:migrate -- --name ma_migration

# Voir l'état des migrations
npx prisma migrate status

# Réinitialiser la base de données (DELETE ALL DATA!)
npx prisma migrate reset

# Générer les types Prisma
npx prisma generate

# Visualiser le schéma
npx prisma studio
```

## Dépannage

```bash
# Réinstaller les modules
rm -rf node_modules package-lock.json
npm install

# Recharger VS Code
# Ctrl+Shift+P → Developer: Reload Window

# Tuer un processus Electron
pkill -f electron

# Vider le cache npm
npm cache clean --force

# Vérifier les versions
npm --version
node --version
npx prisma --version
```

## Scripts npm (package.json)

| Commande | Utilité |
|----------|---------|
| `npm run dev` | Lancer en développement |
| `npm run build` | Compiler TypeScript |
| `npm start` | Lancer l'app compilée |
| `npm run package` | Créer l'executable |
| `npm run db:push` | Synchroniser schéma |
| `npm run db:migrate` | Créer migration |
| `npm run db:seed` | Charger données initiales |
| `npm run prisma:generate` | Générer client Prisma |
| `npm run lint` | Vérifier le code |
| `npm run format` | Formater le code |

## MySQL (Base de Données)

```bash
# Démarrer MySQL (Windows)
net start MySQL80

# Démarrer MySQL (Linux)
sudo systemctl start mysql

# Démarrer MySQL (macOS)
brew services start mysql

# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE conexion_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Voir les bases de données
SHOW DATABASES;

# Supprimer la base (ATTENTION!)
DROP DATABASE conexion_app;
```

## Variables d'Environnement (.env)

```
DATABASE_URL="mysql://root:@localhost:3306/conexion_app"
NODE_ENV="development"
```

## Debug

```bash
# Ouvrir les DevTools dans Electron
# Automatiquement ouvert en développement
# Ou : Ctrl+Shift+I dans l'app

# Voir les logs de Prisma
set DEBUG=*

# Lancer avec logs détaillés
npm run dev -- --verbose
```

## Fichiers Importants à Modifier

| Fichier | Pour |
|---------|------|
| `src/api/*.ts` | Ajouter des services métier |
| `src/main/events.ts` | Ajouter des handlers IPC |
| `src/main/preload.ts` | Exposer les APIs |
| `src/renderer/App.tsx` | Modifier l'interface |
| `src/renderer/components/` | Ajouter des composants |
| `prisma/schema.prisma` | Modifier le schéma BD |
| `package.json` | Ajouter des dépendances |

## Ajouter une Dépendance

```bash
# NPM
npm install mon-package

# Avec version spécifique
npm install mon-package@1.0.0

# Dépendance de développement
npm install --save-dev mon-package

# Yarn (optionnel)
yarn add mon-package
```

## Git (Gestion du code)

```bash
# Vérifier l'état
git status

# Ajouter les fichiers
git add .

# Créer un commit
git commit -m "Description du changement"

# Pousser vers GitHub
git push origin main

# Créer une branche
git checkout -b ma-feature

# Revenir au main
git checkout main
```

---

**Besoin d'aide ?**
- Consulter README.md
- Consulter SETUP_GUIDE.md
- Ouvrir une issue GitHub
