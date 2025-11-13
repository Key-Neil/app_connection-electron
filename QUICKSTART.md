# 🚀 Guide de démarrage rapide - Connextion App

## 1️⃣ Installation des dépendances

```bash
npm install
```

## 2️⃣ Configuration de la base de données

### Créer la base de données MySQL

1. Ouvrir MySQL Workbench ou phpMyAdmin
2. Exécuter cette commande SQL :

```sql
CREATE DATABASE conexion_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Configurer l'URL de connexion

1. Créer un fichier `.env` (copier depuis `.env.example`) :

```bash
cp .env.example .env
```

2. Modifier `.env` avec vos identifiants MySQL :

```
DATABASE_URL="mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/conexion_app"
NODE_ENV="development"
```

## 3️⃣ Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run db:migrate

# Ajouter les données initiales (rôles)
npm run db:seed
```

## 4️⃣ Lancer l'application

```bash
npm run dev
```

L'application s'ouvrira automatiquement.

---

## 📝 Commandes utiles

| Commande | Utilité |
|----------|---------|
| `npm run dev` | Développement avec hot reload |
| `npm run build` | Compiler TypeScript |
| `npm start` | Lancer l'app compilée |
| `npm run db:migrate` | Créer une nouvelle migration |
| `npm run db:seed` | Réexécuter les données initiales |
| `npm run lint` | Vérifier le code |
| `npm run format` | Formater le code |
| `npm run package` | Créer l'executable |

---

## 🆘 Troubleshooting

### ❌ Erreur : "ECONNREFUSED 127.0.0.1:3306"

**Problème** : MySQL n'est pas en cours d'exécution

**Solution** :
- Windows : Services → MySQL → Démarrer
- Linux : `sudo systemctl start mysql`
- Mac : `brew services start mysql`

### ❌ Erreur : "Access denied for user 'root'"

**Problème** : Identifiants MySQL incorrects dans `.env`

**Solution** : Vérifier `DATABASE_URL` dans `.env`

### ❌ Erreur : "Unknown database 'conexion_app'"

**Problème** : La base n'existe pas

**Solution** : Exécuter le SQL de création plus haut

### ❌ "Cannot find module 'electron'"

**Problème** : Dépendances non installées

**Solution** :
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Structure du projet

```
Connextion-app-electron/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # Interface React
│   ├── database/       # Prisma
│   ├── api/            # Services métier
│   ├── types/          # Types TypeScript
│   └── utils/          # Utilitaires
├── prisma/
│   └── schema.prisma   # Schéma BD
├── .env                # Variables sensibles (à ignorer)
├── .gitignore
├── package.json
├── tsconfig.json
└── webpack.*.config.js
```

---

## 🎯 Prochaines étapes

1. ✅ Explorer l'app en mode développement
2. 📖 Lire le README.md pour plus de détails
3. 🔧 Ajouter vos premiers modèles/services
4. 🎨 Customiser l'interface React
5. 📦 Builder l'executable avec `npm run package`

---

**Besoin d'aide ?** Consultez la documentation :
- Electron : https://www.electronjs.org/docs
- Prisma : https://www.prisma.io/docs/
- React : https://react.dev/

**Bon développement! 🚀**
