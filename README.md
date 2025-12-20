# 🚀 Keynect – Application de Livraison & Gestion Restaurant

Keynect est une application desktop de gestion complète pour les services de livraison de repas. Elle permet de gérer les restaurants, les commandes, la préparation en cuisine et les livraisons via une interface multi-rôles.

**Technologies utilisées :** Electron • TypeScript • Prisma • Node.js • MySQL

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités-clés)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation rapide](#-installation-rapide)
- [Configuration détaillée](#️-configuration-détaillée)
- [Lancement](#️-lancement)
- [Comptes de test](#-comptes-de-test)
- [Structure du projet](#-structure-du-projet)
- [Commandes disponibles](#️-commandes-disponibles)
- [Dépannage](#-dépannage)

---

## 🎯 Fonctionnalités Clés

### 👤 Client
- Parcourir les restaurants et leurs menus
- Gérer son panier et passer des commandes
- Suivre l'état de ses commandes en temps réel

### 🏪 Restaurant
- Gérer les informations du restaurant (adresse, téléphone)
- Créer et modifier les sections de menu
- Ajouter/modifier/supprimer des produits
- Valider les commandes reçues

### 👨‍🍳 Cuisinier
- Visualiser les commandes à préparer
- Mettre à jour le statut des commandes
- Marquer les commandes comme prêtes pour la livraison

### 🚗 Livreur
- Voir les commandes disponibles à livrer
- Accepter une livraison
- Confirmer la livraison au client

### 👑 Administrateur
- Gérer les utilisateurs et leurs rôles
- Assigner le staff aux restaurants
- Superviser l'ensemble du système
- Gérer les menus globaux

---

## ⚡ Architecture

L'application suit une architecture Electron classique avec séparation des responsabilités :

```
┌─────────────────────────────────────────┐
│  Renderer (Frontend - SPA)              │
│  - Interface utilisateur                │
│  - Routing dynamique                    │
│  - Gestion des rôles                    │
└─────────────┬───────────────────────────┘
              │ IPC Communication
┌─────────────▼───────────────────────────┐
│  Preload (Pont sécurisé)                │
│  - Exposition API sécurisée             │
│  - contextIsolation                     │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  Main (Backend)                         │
│  - Handlers IPC                         │
│  - Logique métier                       │
│  - Accès base de données (Prisma)      │
└─────────────────────────────────────────┘
```

**Fichiers principaux :**
- `src/main/main.ts` – Backend unifié (handlers IPC + Prisma)
- `src/preload/preload.ts` – Pont sécurisé entre frontend et backend
- `src/renderer/index.html` – Single Page Application (SPA)
- `src/renderer/*.ts` – Logique frontend par rôle

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé les 3 éléments suivants sur votre système :

### 1. Node.js (v18 ou supérieur)

**📥 Installation :**
- **Toutes les plateformes :** Télécharger l'installeur sur https://nodejs.org/
  - macOS : Fichier `.pkg`
  - Windows : Fichier `.msi`
  - Ubuntu/Linux : Fichier `.deb` ou via gestionnaire de paquets

**Ubuntu/Debian (via terminal) :**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**✅ Vérifier l'installation :**
```bash
node --version
npm --version
```

### 2. MySQL (v8.x recommandé)

**📥 Installation selon votre système :**

**🍎 macOS :**
1. Télécharger : https://dev.mysql.com/downloads/mysql/
2. Installer le fichier `.dmg`
3. Démarrer MySQL depuis Préférences Système → MySQL

**🪟 Windows :**
1. Télécharger : https://dev.mysql.com/downloads/installer/
2. Installer MySQL Installer (choisir "Developer Default")
3. Définir un mot de passe root (à noter pour la config)
4. Le service démarre automatiquement

**🐧 Ubuntu/Debian :**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation  # Configurer le mot de passe root
```

**✅ Vérifier l'installation :**
```bash
mysql --version
```

> **💡 Important :** Si la commande `mysql` ne fonctionne pas, MySQL est peut-être installé mais pas dans votre PATH. L'essentiel est que le **service MySQL soit actif**. Vous pouvez vérifier :
> - **macOS :** Préférences Système → MySQL → "MySQL Server is running"
> - **Windows :** Services (`services.msc`) → MySQL → État "En cours d'exécution"
> - **Ubuntu :** `sudo systemctl status mysql`

### 3. Git

**📥 Installation :**
- **Télécharger :** https://git-scm.com/downloads
- **macOS :** Installeur `.dmg` ou `brew install git` (si Homebrew installé)
- **Windows :** Installeur `.exe` (accepter les options par défaut)
- **Ubuntu :** `sudo apt-get install git`

**✅ Vérifier l'installation :**
```bash
git --version
```

---

## 🚀 Installation rapide

Pour les utilisateurs pressés, voici les commandes essentielles :

**🍎 macOS / 🐧 Ubuntu/Linux :**
```bash
# 1. Cloner le projet
git clone https://github.com/Key-Neil/app_connection-electron.git
cd app_connection-electron

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
touch .env

# 4. Éditer .env et ajouter votre connexion MySQL
# DATABASE_URL="mysql://root:votreMotDePasse@localhost:3306/app_connection"

# 5. Créer la base de données
mysql -u root -p < scripts/create-db.sql

# 6. Initialiser le schéma
npx prisma db push
npm run seed

# 7. Lancer l'application
npm start
```

**🪟 Windows (CMD) :**
```cmd
REM 1. Cloner le projet
git clone https://github.com/Key-Neil/app_connection-electron.git
cd app_connection-electron

REM 2. Installer les dépendances
npm install

REM 3. Créer le fichier .env
type nul > .env

REM 4. Éditer .env avec le Bloc-notes et ajouter :
REM DATABASE_URL="mysql://root:votreMotDePasse@localhost:3306/app_connection"

REM 5. Créer la base de données
mysql -u root -p < scripts\create-db.sql

REM 6. Initialiser le schéma
npx prisma db push
npm run seed

REM 7. Lancer l'application
npm start
```

**🪟 Windows (PowerShell) :**
```powershell
# 1. Cloner le projet
git clone https://github.com/Key-Neil/app_connection-electron.git
cd app_connection-electron

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
New-Item .env -ItemType File

# 4. Éditer .env avec le Bloc-notes et ajouter :
# DATABASE_URL="mysql://root:votreMotDePasse@localhost:3306/app_connection"

# 5. Créer la base de données
mysql -u root -p < scripts/create-db.sql

# 6. Initialiser le schéma
npx prisma db push
npm run seed

# 7. Lancer l'application
npm start
```

---

## ⚙️ Configuration détaillée

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/Key-Neil/app_connection-electron.git
cd app_connection-electron
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Cela installera :
- **Electron** v31+ – Framework desktop multi-plateforme
- **TypeScript** v5.9+ – Langage de programmation typé
- **Prisma** v5.17+ – ORM pour la base de données
- **Bcryptjs** v2.4+ – Hashage sécurisé des mots de passe
- **Electron Forge** – Packaging de l'application

### Étape 3 : Créer le fichier `.env`

À la racine du projet (même dossier que `package.json`), créez un fichier `.env` :

**🍎 macOS / 🐧 Ubuntu/Linux :**
```bash
touch .env
```

**🪟 Windows (CMD) :**
```cmd
type nul > .env
```

**🪟 Windows (PowerShell) :**
```powershell
New-Item .env -ItemType File
```

**Ou simplement :** Créez un nouveau fichier texte nommé `.env` (sans extension) avec votre éditeur de texte.

### Étape 4 : Configurer la connexion MySQL

Ouvrez le fichier `.env` avec votre éditeur de texte et ajoutez :

```env
DATABASE_URL="mysql://root:votreMotDePasse@localhost:3306/app_connection"
```

**⚠️ Important :** Remplacez `votreMotDePasse` par votre **vrai** mot de passe MySQL.

**Format de l'URL :**
```
DATABASE_URL="mysql://[utilisateur]:[motdepasse]@[host]:[port]/[nom_base]"
```

**Exemples valides :**
```env
# Avec mot de passe
DATABASE_URL="mysql://root:monmotdepasse123@localhost:3306/app_connection"

# Sans mot de passe (développement local uniquement)
DATABASE_URL="mysql://root@localhost:3306/app_connection"

# Avec utilisateur personnalisé
DATABASE_URL="mysql://keynect_user:motdepasse@localhost:3306/app_connection"
```

**❌ Erreurs courantes :**
```env
# ❌ Mauvais : double deux-points après le mot de passe
DATABASE_URL="mysql://root:password:@localhost:3306/app_connection"

# ✅ Bon : un seul deux-points
DATABASE_URL="mysql://root:password@localhost:3306/app_connection"
```

### Étape 5 : Créer la base de données

Créez un script SQL pour initialiser la base de données :

**Créez un fichier `scripts/create-db.sql` :**
```sql
-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS app_connection;

-- Sélectionner la base de données
USE app_connection;

-- Les tables seront créées par Prisma lors du prochain push
```

Puis exécutez le script :

```bash
mysql -u root -p < scripts/create-db.sql
```

### Étape 6 : Initialiser le schéma avec Prisma

Synchronisez le schéma Prisma avec la base de données :

```bash
npx prisma db push
```

**Résultat attendu :**
```
✅ MySQL database app_connection created at localhost:3306
✅ Your database is now in sync with your Prisma schema
```

### Étape 7 : Insérer les données de test

Puis insérez les données de test :

```bash
npm run seed
```

**Résultat attendu :**
```
✅ Rôles créés
✅ Utilisateurs créés (Admin, Cuisinier, Livreur, Client)
✅ Restaurants créés (4)
✅ Produits créés (60+)
🎉 Seeding terminé avec succès !
```

---

## ▶️ Lancement

### Démarrer l'application

```bash
npm start
```

L'application compile le code TypeScript puis se lance automatiquement. Vous pouvez vous connecter avec les [comptes de test](#-comptes-de-test).

### Mode développement

Pour le développement avec rechargement automatique :

```bash
npm run dev
```

> Tapez `rs` dans le terminal pour redémarrer le processus principal.

---

## 🔐 Comptes de test

Après avoir exécuté `npm run seed`, vous disposez de ces comptes :

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| 👑 **Admin** | admin@keynect.com | test | Accès complet à toutes les fonctionnalités |
| 👨‍🍳 **Cuisinier** | chef@keynect.com | test | Gestion des commandes en cuisine |
| 🚗 **Livreur** | livreur@keynect.com | test | Gestion des livraisons |
| 👤 **Client** | client@keynect.com | test | Interface client standard |

> **Note :** Le rôle **Client** est automatiquement attribué à chaque nouvelle inscription. Les autres rôles (Cuisinier, Livreur, Admin) sont assignés par l'administrateur via l'interface.

---

## 📁 Structure du projet

```
app_connection-electron/
├── src/
│   ├── main/                      # Backend (Node.js + Electron)
│   │   ├── main.ts               # Point d'entrée + IPC handlers
│   │   ├── prisma/               # Base de données
│   │   │   ├── schema.prisma     # Schéma DB (normalisé 3NF)
│   │   │   ├── seed.ts           # Données de test
│   │   │   └── migrations/       # Historique des migrations
│   │   └── utilitaires/          # Helpers (Prisma client, etc.)
│   │       ├── prisma.ts         # Instance Prisma
│   │       └── sections.ts       # Gestion sections menu
│   │
│   ├── renderer/                  # Frontend (HTML + TypeScript)
│   │   ├── index.html            # SPA unique
│   │   ├── index.css             # Styles globaux
│   │   ├── main.ts               # Point d'entrée frontend
│   │   ├── navigation.ts         # Routing dynamique
│   │   ├── state.ts              # Gestion état global
│   │   ├── auth.ts               # Authentification
│   │   ├── admin.ts              # Interface admin
│   │   ├── restaurants.ts        # Gestion restaurants
│   │   ├── cook.ts               # Interface cuisinier
│   │   ├── livreur.ts            # Interface livreur
│   │   ├── commandes.ts          # Gestion commandes
│   │   └── utils.ts              # Fonctions utilitaires
│   │
│   ├── preload/                   # Pont sécurisé IPC
│   │   └── preload.ts            # Exposition API au renderer
│   │
│   └── types/                     # Définitions TypeScript
│       └── global.d.ts           # Types globaux
│
├── dist/                          # Code compilé (généré)
├── out/                           # Packages générés (make)
├── docs/                          # Documentation
│   ├── mcd.drawio               # Modèle conceptuel
│   └── mld.drawio               # Modèle logique
├── .env                          # Variables d'environnement
├── build.ts                      # Script de compilation
├── forge.config.js               # Config Electron Forge
├── package.json                  # Dépendances npm
├── tsconfig.json                 # Config TypeScript
└── README.md                     # Ce fichier
```

**Points clés :**
- **main.ts** : Handlers IPC + logique métier + accès Prisma
- **preload.ts** : Pont sécurisé (contextIsolation activé)
- **renderer/*.ts** : Logique UI par rôle (routing + validation)
- **sections.json** : Généré automatiquement pour le stockage des sections menu

---

## 🛠️ Commandes disponibles

```bash
# Développement
npm start                  # Compile + lance l'application
npm run dev                # Lance sans compilation (pour debug)
npm run build              # Compile TypeScript → JavaScript

# Base de données
npx prisma db push         # Synchronise le schéma avec la DB
npx prisma migrate dev     # Crée une nouvelle migration
npx prisma studio          # Interface graphique pour la DB
npm run seed               # Insère les données de test

# Production
npm run make               # Génère un exécutable (dans out/)
npm run publish            # Publie l'application

# Maintenance
npm run rebuild            # Recompile complètement
npx prisma migrate reset   # Réinitialise la DB (⚠️ supprime toutes les données)
npx prisma generate        # Régénère le client Prisma
```

---

## 🔧 Pile Technique

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **Electron** | v31+ | Framework desktop multi-plateforme |
| **TypeScript** | v5.9+ | Langage de programmation typé |
| **Node.js** | v18+ | Runtime JavaScript |
| **Prisma** | v5.17+ | ORM pour base de données |
| **MySQL** | v8.x | Base de données relationnelle |
| **Bcryptjs** | v2.4+ | Hashage sécurisé des mots de passe |
| **Electron Forge** | v7+ | Packaging et distribution |

---

## ❓ Dépannage

### 🔴 Erreur : `P1000: Authentication failed`

**Problème :** Les identifiants MySQL dans `.env` sont incorrects.

**Solutions :**
1. Vérifiez votre mot de passe MySQL
2. Assurez-vous qu'il n'y a qu'un seul `:` entre utilisateur et mot de passe
3. Testez la connexion MySQL :
   ```bash
   mysql -u root -p
   # Entrez votre mot de passe
   ```

**Format correct :**
```env
# ✅ Bon
DATABASE_URL="mysql://root:motdepasse@localhost:3306/app_connection"

# ❌ Mauvais (double deux-points)
DATABASE_URL="mysql://root:motdepasse:@localhost:3306/app_connection"
```

### 🔴 Erreur : `Can't connect to MySQL server`

**Problème :** Le service MySQL n'est pas démarré.

**Solutions selon votre système :**

**🍎 macOS :**
```bash
# Vérifier si MySQL est actif
ps aux | grep mysql

# Démarrer MySQL (installation via .dmg)
sudo /usr/local/mysql/support-files/mysql.server start

# Ou via Préférences Système
# Aller dans : Préférences Système → MySQL → Start MySQL Server
```

**🪟 Windows :**
1. Appuyer sur `Win + R`
2. Taper `services.msc` et valider
3. Chercher "MySQL" ou "MySQL80" dans la liste
4. Clic droit → **Démarrer**
5. (Optionnel) Clic droit → Propriétés → Type de démarrage : **Automatique**

**🐧 Ubuntu/Linux :**
```bash
# Démarrer MySQL
sudo systemctl start mysql

# Vérifier le statut
sudo systemctl status mysql

# Activer au démarrage
sudo systemctl enable mysql
```

### 🔴 Erreur : `DATABASE_URL not found`

**Problème :** Le fichier `.env` n'existe pas ou est mal placé.

**Solution :**
1. Créez `.env` à la **racine** du projet (même niveau que `package.json`)
2. Ajoutez la variable `DATABASE_URL`

### 🔴 Erreur : `Prisma Client not found`

**Problème :** Le client Prisma n'a pas été généré.

**Solution :**
```bash
npm install
npx prisma generate
```

### 🔴 Page blanche au lancement

**Problème :** Le code TypeScript n'a pas été compilé.

**Solution :**
```bash
npm run build
npm start
```

### 🔴 Erreur : `mysql: command not found`

**Problème :** MySQL n'est pas dans le PATH (mais peut être installé et fonctionnel).

**Ce n'est généralement pas bloquant** si le service MySQL tourne. Vous pouvez vérifier :

**🍎 macOS :**
```bash
# Vérifier si MySQL tourne
ps aux | grep mysql

# Ajouter MySQL au PATH (si nécessaire)
echo 'export PATH="/usr/local/mysql/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**🪟 Windows :**
- Ouvrir Services (`Win + R` → `services.msc`)
- Vérifier que "MySQL80" est en cours d'exécution
- MySQL est fonctionnel même si la commande `mysql` ne marche pas dans CMD

**🐧 Ubuntu/Linux :**
```bash
# Vérifier le service
sudo systemctl status mysql

# Si MySQL n'est pas installé
sudo apt-get install mysql-client
```

### 🔴 Erreur lors du seed : `Duplicate entry`

**Problème :** Vous essayez de réinsérer des données déjà existantes.

**Solution :**
```bash
# Réinitialiser complètement la base de données
npx prisma migrate reset --force
npm run seed
```

---

## ✅ Checklist de démarrage

Avant de lancer l'application, vérifiez :

- [ ] Node.js installé (`node --version` fonctionne)
- [ ] MySQL installé et **service actif**
- [ ] Fichier `.env` créé à la racine
- [ ] Variable `DATABASE_URL` configurée dans `.env`
- [ ] `npm install` exécuté avec succès
- [ ] `npx prisma db push` exécuté avec succès
- [ ] `npm run seed` exécuté avec succès
- [ ] `npm start` lance l'application sans erreurs

---

## 📦 Générer un exécutable

Pour créer un package distributable selon votre système :

```bash
npm run make
```

**Les fichiers générés se trouvent dans le dossier `out/` :**

**🍎 macOS :**
- `out/make/` → Fichier `.dmg` (installeur)
- `out/Keynect-darwin-x64/` → Application `.app`

**🪟 Windows :**
- `out/make/squirrel.windows/` → Installeur `.exe`
- `out/Keynect-win32-x64/` → Fichier `.exe` portable

**🐧 Ubuntu/Linux :**
- `out/make/deb/` → Package `.deb` (Debian/Ubuntu)
- `out/make/rpm/` → Package `.rpm` (Fedora/RedHat)
- `out/Keynect-linux-x64/` → Exécutable Linux

**📌 Note :** Sur chaque système, Electron Forge génère automatiquement le format adapté à votre plateforme.

---

## 🔄 Mise à jour du schéma

Si vous modifiez `schema.prisma` :

```bash
# Créer une migration
npx prisma migrate dev --name description_du_changement

# Ou forcer la synchro (développement uniquement)
npx prisma db push
```

Pour réinitialiser complètement la base :

```bash
npx prisma migrate reset --force
npm run seed
```

---

## 🧪 Tests rapides

Après installation, vérifiez que tout fonctionne :

1. **Inscription :** Créer un compte → rôle Client attribué automatiquement
2. **Admin :** Se connecter avec `admin@keynect.com` → Créer un restaurant
3. **Restaurant :** Ajouter des produits au restaurant
4. **Client :** Passer une commande → Vérifier dans "Mes Commandes"
5. **Cuisinier :** Se connecter avec `chef@keynect.com` → Voir la commande
6. **Cuisinier :** Marquer comme "Prête"
7. **Livreur :** Se connecter avec `livreur@keynect.com` → Accepter la livraison
8. **Livreur :** Confirmer la livraison

---

## 🔒 Sécurité

**⚠️ Pour un usage en production, il est recommandé de :**
- Ajouter des validations côté backend pour tous les handlers IPC
- Implémenter un système de tokens/sessions sécurisé
- Sanitiser toutes les entrées utilisateur
- Utiliser HTTPS pour les connexions distantes
- Séparer les responsabilités en micro-services
- Chiffrer les données sensibles
- Mettre en place des logs d'audit

**Actuellement, l'application est configurée pour un usage en développement/démo.**

---

## 📞 Support

Pour toute question ou problème :
- **GitHub Issues :** https://github.com/Key-Neil/app_connection-electron/issues
- **Documentation Prisma :** https://www.prisma.io/docs
- **Documentation Electron :** https://www.electronjs.org/docs

---

## 📄 Licence

Ce projet est sous licence MIT.

---

**Bon usage de Keynect ! 🚀**

*Dernière mise à jour : Décembre 2025*
