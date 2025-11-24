# 🍕 Application de Livraison - Connextion

Application de gestion de commandes de repas avec suivi de livraison en temps réel. Construite avec **Electron**, **TypeScript**, **Node.js**, **Prisma** et **MySQL**.

## 📸 Fonctionnalités

- **Clients**: Parcourir restaurants, commander des repas, payer
- **Restaurants**: Gérer menu et sections, valider commandes
- **Cuisiniers**: Recevoir et préparer les commandes
- **Livreurs**: Récupérer et livrer les commandes
- **Admin**: Gérer utilisateurs et permissions
- **Mini-jeu**: Gagner une commande gratuite en jouant à Snake

---

## 📋 Prérequis (IMPORTANT)

Avant de commencer, assurez-vous d'avoir installé:

1. **Node.js** (v18 ou supérieur)
   - Télécharger: https://nodejs.org/
   - Vérifier: `node --version`

2. **MySQL** (Serveur local ou distant)
   - Télécharger: https://www.mysql.com/downloads/
   - Vérifier: `mysql --version` (depuis cmd/PowerShell)

3. **Git** (pour cloner le repo)
   - Télécharger: https://git-scm.com/

---

## 🚀 Installation complète (5 minutes)

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/Key-Neil/app_connection-electron.git
cd app_connection-electron
```

### 2️⃣ Installer les dépendances npm

```bash
npm install
```

Cela installe:
- Electron (framework desktop)
- TypeScript (langage de programmation)
- Prisma (ORM base de données)
- Autres dépendances

### 3️⃣ Configurer la base de données

#### Option A: MySQL local (recommandé)

1. **Créer un fichier `.env` à la racine** du projet:
   ```bash
   # Sur Windows (cmd):
   type nul > .env
   
   # Sur Mac/Linux:
   touch .env
   ```

2. **Ajouter la connexion MySQL** dans `.env`:
   ```
   DATABASE_URL="mysql://root:votreMotDePasse@localhost:3306/app_connection"
   ```
   - Remplacez `votreMotDePasse` par votre mot de passe MySQL
   - Si pas de mot de passe: `mysql://root@localhost:3306/app_connection`

#### Option B: Utiliser Prisma PostgreSQL (cloud)

1. Créer un compte gratuit: https://console.prisma.io
2. Créer une nouvelle base de données
3. Copier la chaîne de connexion dans `.env`:
   ```
   DATABASE_URL="[votre-url-postgres-du-console-prisma]"
   ```

### 4️⃣ Initialiser la base de données

```bash
# Créer les tables dans la BD
npx prisma migrate dev --name init

# (Ou utiliser) - Créer et mettre à jour le schéma
npx prisma db push

# Insérer les données de test (Admin, 3 restaurants, produits)
npm run seed
```

**Résultat attendu:**
- ✅ 5 tables créées (Utilisateur, Restaurant, Commande, Livraison, Rôle)
- ✅ 1 utilisateur Admin (email: admin@gmail.com, mot de passe: admin)
- ✅ 3 restaurants pré-remplis avec menus

---

## ▶️ Lancer l'application

### Pour lancer l'app:

```bash
npm start
```

L'application démarre, et vous pouvez vous connecter avec:
- **Email**: admin@gmail.com
- **Mot de passe**: admin

### Pour développer (mode debug):

```bash
npm run dev
```

---

## 📁 Structure du projet

```
app_connection-electron/
├── src/
│   ├── main/              # Code Electron principal (TypeScript)
│   │   ├── main.ts        # Point d'entrée
│   │   ├── controleurs/   # Logique métier (auth, commandes, restaurants)
│   │   └── utilitaires/   # Helpers (Prisma, Auth)
│   ├── renderer/          # Interface utilisateur (TypeScript)
│   │   ├── index.html     # Page login
│   │   ├── tableauDeBord.html   # Dashboard admin
│   │   └── *.ts           # Logique front
│   ├── preload/           # Pont IPC Electron
│   └── types/             # Définitions TypeScript globales
├── prisma/
│   ├── schema.prisma      # Schéma base de données
│   ├── migrations/        # Historique des changements BD
│   └── seed.ts            # Script d'insertion de données
├── dist/                  # Code compilé (généré, .gitignored)
├── build.ts               # Script de compilation TypeScript
├── package.json           # Dépendances npm et scripts
├── tsconfig.json          # Configuration TypeScript
└── README.md              # Ce fichier
```

---

## 🛠️ Scripts npm disponibles

```bash
npm run build              # Compile TypeScript → JavaScript
npm start                  # Build + lance l'app Electron
npm run dev                # Lance l'app sans recompilation
npm run rebuild            # Recompile tout de zéro
npm run seed               # Injecte les données de test
npm run copy-assets        # Copie HTML/CSS vers dist/
```

---

## 🔐 Comptes de test pré-remplis

Après `npm run seed`:

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Admin** | admin@gmail.com | admin |

Pour tester les autres rôles, créez des comptes via l'interface d'enregistrement.

---

## ❓ Dépannage

### Erreur: `DATABASE_URL not found`
**Solution**: Créez le fichier `.env` avec votre URL MySQL (voir section 3)

### Erreur: `Can't connect to MySQL server`
**Solutions**:
- Vérifier que MySQL est lancé
- Vérifier l'adresse (localhost), le port (3306), le mot de passe
- Tester la connexion: `mysql -u root -p`

### Erreur: `Prisma Client not found`
**Solution**:
```bash
npm install
npx prisma generate
```

### L'application se lance mais les pages sont blanches
**Solution**:
```bash
npm run build      # Recompile TypeScript
npm start          # Relance l'app
```

---

## 📚 Documentation des rôles

### 👤 Client
- Se connecter / s'inscrire
- Parcourir les restaurants et menus
- Ajouter des articles au panier
- Passer une commande
- Jouer à Snake pour une réduction
- Suivre ses commandes

### 🏪 Restaurant
- Gérer les informations (adresse, téléphone)
- Créer/modifier sections de menu
- Ajouter/supprimer produits
- Valider les commandes reçues

### 👨‍🍳 Cuisinier
- Voir les commandes à préparer
- Marquer comme prêtes
- Voir les détails des produits

### 🚗 Livreur
- Voir les commandes disponibles à livrer
- Prendre une livraison
- Confirmer la livraison

### 👑 Admin
- Gérer tous les utilisateurs
- Assigner les rôles et permissions

---

## 🔧 Technologie utilisée

| Technologie | Version | Utilisation |
|-----------|---------|------------|
| **Electron** | v31+ | Framework desktop |
| **TypeScript** | v5.9+ | Typage strict |
| **Node.js** | v18+ | Runtime |
| **Prisma** | v5.17+ | ORM base de données |
| **MySQL** | - | Base de données |
| **Bcryptjs** | v2.4+ | Hashage mots de passe |

---

## 📝 Variables d'environnement

Créez un fichier `.env` à la racine:

```env
# Base de données MySQL
DATABASE_URL="mysql://root:motdepasse@localhost:3306/app_connection"
```

---

## ✅ Checklist avant de lancer

- [ ] Node.js installé (`node --version`)
- [ ] MySQL en cours d'exécution
- [ ] `.env` créé avec `DATABASE_URL`
- [ ] `npm install` exécuté
- [ ] `npx prisma db push` exécuté
- [ ] `npm run seed` exécuté
- [ ] `npm start` lance l'app sans erreurs

---

**Bonne utilisation de Connextion! 🚀**
