# 🎯 PLAN D'INSTALLATION ET DÉMARRAGE

## Étape 1: Installation des dépendances (2-3 minutes)

```bash
cd Connextion-app-electron
npm install
```

**Qu'est-ce que cela fait ?**
- Télécharge tous les modules Node.js nécessaires (electron, react, prisma, etc.)
- Crée le dossier `node_modules/`
- Génère le fichier `package-lock.json`
- Les erreurs TypeScript disparaîtront après cette étape

---

## Étape 2: Configuration MySQL (1-2 minutes)

### A. Démarrer MySQL

**Windows :**
- Services Windows → MySQL → Démarrer

**Linux :**
```bash
sudo systemctl start mysql
```

**macOS :**
```bash
brew services start mysql
```

### B. Créer la base de données

Ouvrir MySQL Workbench ou phpMyAdmin et exécuter :

```sql
CREATE DATABASE conexion_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### C. Vérifier la connexion

```bash
mysql -u root -p
# Entrer votre mot de passe MySQL
```

---

## Étape 3: Configurer les variables d'environnement (1 minute)

Le fichier `.env` est déjà créé, mais vérifiez-le :

**Fichier `.env` :**
```
DATABASE_URL="mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/conexion_app"
NODE_ENV="development"
```

**Si vous n'avez pas de mot de passe MySQL :**
```
DATABASE_URL="mysql://root:@localhost:3306/conexion_app"
```

---

## Étape 4: Initialiser la base de données (1-2 minutes)

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables automatiquement
npm run db:migrate

# Ajouter les données initiales (rôles)
npm run db:seed
```

**Qu'est-ce que cela fait ?**
1. `prisma:generate` → Crée le client TypeScript pour accéder à la BD
2. `db:migrate` → Exécute le schéma Prisma et crée les 9 tables
3. `db:seed` → Ajoute les rôles par défaut (client, livreur, restaurant, admin)

---

## Étape 5: Lancer l'application (30 secondes)

```bash
npm run dev
```

**Qu'est-ce qui se passe ?**
1. Webpack compile le code React
2. Electron se lance
3. L'application s'ouvre automatiquement
4. Les DevTools s'ouvrent (vous pouvez les fermer)

L'app affichera une page d'accueil avec la liste des utilisateurs (vide au départ).

---

## ✅ Vous avez réussi ! 🎉

Si tout s'est bien déroulé :
- ✅ Electron s'ouvre
- ✅ React charge correctement
- ✅ Aucune erreur de base de données
- ✅ Vous voyez la page d'accueil

---

## 🔧 Commandes utiles pendant le développement

```bash
# Développement avec hot reload
npm run dev

# Compiler le code (sans lancer l'app)
npm run build

# Lancer l'app compilée
npm start

# Vérifier le code (ESLint)
npm run lint

# Formater le code (Prettier)
npm run format

# Créer des tables supplémentaires
npm run db:migrate

# Recharger les données de seed
npm run db:seed

# Voir les données de la BD (interface Prisma)
npx prisma studio
```

---

## 🐛 Troubleshooting

### ❌ "ECONNREFUSED 127.0.0.1:3306"

**Cause :** MySQL n'est pas en cours d'exécution

**Solution :**
```bash
# Windows
sc start MySQL80

# Linux
sudo systemctl start mysql

# macOS
brew services start mysql
```

### ❌ "Access denied for user 'root'"

**Cause :** Mot de passe incorrect ou utilisateur inexistant

**Solution :** Vérifier `DATABASE_URL` dans `.env`

### ❌ "Unknown database 'conexion_app'"

**Cause :** La base n'existe pas

**Solution :** Créer la base avec le SQL fourni plus haut

### ❌ "Cannot find module 'react'"

**Cause :** `npm install` n'a pas fini ou a échoué

**Solution :**
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Erreurs TypeScript dans l'éditeur

**Cause :** VS Code n'a pas reconnu les nouvelles dépendances

**Solution :** Redémarrer VS Code (Ctrl+Shift+P → Developer: Reload Window)

---

## 📚 Ressources

- **Electron :** https://www.electronjs.org/docs
- **React :** https://react.dev/
- **TypeScript :** https://www.typescriptlang.org/
- **Prisma :** https://www.prisma.io/docs/
- **MySQL :** https://dev.mysql.com/doc/

---

## 📞 Besoin d'aide ?

1. Consulter `QUICKSTART.md` pour des instructions rapides
2. Consulter `README.md` pour l'architecture complète
3. Consulter `ARCHITECTURE.md` pour les détails techniques
4. Ouvrir une issue sur GitHub

---

**C'est parti ! Bon développement 🚀**
