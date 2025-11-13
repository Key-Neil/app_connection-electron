# 📚 Guide de Documentation - Connextion App

Bienvenue dans le projet Connextion App ! Ce guide vous aide à naviguer dans la documentation.

---

## 🚀 JE VEUX DÉMARRER RAPIDEMENT

**→ Consultez `SETUP_GUIDE.md`**

Guide étape par étape pour :
- Installer les dépendances
- Configurer MySQL
- Initialiser la BD
- Lancer l'application

⏱️ **Temps estimé : 10-15 minutes**

---

## 📖 JE VEUX COMPRENDRE L'ARCHITECTURE

**→ Consultez `ARCHITECTURE.md`**

Explique :
- Structure complète des dossiers
- Tous les fichiers créés
- Architecture modulaire
- Modèles Prisma

⏱️ **Temps estimé : 10 minutes de lecture**

---

## 🎓 JE VEUX APPRENDRE À CODER

**→ Consultez `QUICKSTART.md`**

Fournit :
- Commandes npm expliquées
- Exemples de code
- Conventions de nommage
- Troubleshooting courant

⏱️ **Temps estimé : 15 minutes**

---

## 🔍 JE VEUX LES DÉTAILS COMPLETS

**→ Consultez `README.md`**

Documentation exhaustive :
- Installation détaillée
- Configuration Prisma
- Scripts npm
- Base de données
- Sécurité
- Contribution

⏱️ **Temps estimé : 30 minutes**

---

## 💻 JE VEUX DES EXEMPLES DE CODE

**→ Consultez `src/renderer/components/ExampleComponent.tsx`**

Montre comment :
- Appeler les APIs Electron
- Gérer l'état React
- Afficher les erreurs
- Récupérer les données

⏱️ **Temps estimé : 10 minutes**

---

## 🏗️ ORGANISATION DES FICHIERS

```
📄 Documentation
├── SETUP_GUIDE.md        ← START HERE! ⭐
├── QUICKSTART.md         ← Instructions rapides
├── ARCHITECTURE.md       ← Structure du projet
├── README.md             ← Documentation complète
└── DOC_INDEX.md          ← Vous êtes ici

📁 Code Source
├── src/main/             ← Electron main process
├── src/renderer/         ← Interface React
├── src/database/         ← Prisma ORM
├── src/api/              ← Services métier
├── src/types/            ← Types TypeScript
└── src/utils/            ← Utilitaires

⚙️ Configuration
├── package.json          ← Dépendances
├── tsconfig.json         ← TypeScript
├── .env                  ← Variables (à ne pas commiter)
├── .env.example          ← Template .env
└── webpack.*.config.js   ← Build config
```

---

## 🎯 PARCOURS RECOMMANDÉ

### Pour débuter (< 30 min)

1. ✅ Lire `SETUP_GUIDE.md` (5 min)
2. ✅ Installer les dépendances et configurer (15 min)
3. ✅ Lancer `npm run dev` (5 min)
4. ✅ Explorer l'interface (5 min)

### Pour développer (1-2 heures)

1. ✅ Lire `ARCHITECTURE.md` (10 min)
2. ✅ Consulter `ExampleComponent.tsx` (10 min)
3. ✅ Lancer `SETUP_GUIDE.md` au besoin (5 min)
4. ✅ Commencer à développer (reste du temps)

### Pour approfondir (2-3 heures)

1. ✅ Lire `README.md` complètement (30 min)
2. ✅ Explorer le code source (30 min)
3. ✅ Consulter les docs officielles (1-2 heures)
4. ✅ Pratiquer en ajoutant des features

---

## 🔗 LIENS UTILES

### Officiels
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tutoriels
- [Electron Quickstart](https://www.electronjs.org/docs/latest/tutorial/quick-start)
- [React Getting Started](https://react.dev/learn)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)

### Communautés
- [Electron Discord](https://discord.gg/electron)
- [React Community](https://react.dev/community)
- [Stack Overflow - electron tag](https://stackoverflow.com/questions/tagged/electron)

---

## 🆘 PROBLÈMES COURANTS

### Je vois des erreurs TypeScript

**Solution :** C'est normal avant d'installer les dépendances. Exécutez `npm install`.

### MySQL ne démarre pas

**Solution :** Consultez `SETUP_GUIDE.md` section Troubleshooting.

### L'app se lance mais affiche une page blanche

**Solution :** Vérifier la console de développement (DevTools ouvert par défaut).

### Comment ajouter une nouvelle feature ?

**Solution :** Lire `README.md` section "Ajouter une nouvelle feature".

---

## ✨ POINT D'ENTRÉE RAPIDE

Si vous êtes **très pressé** :

```bash
# 1. Installer
npm install

# 2. Configurer .env (déjà fait)

# 3. Créer la base de données MySQL
mysql -u root -e "CREATE DATABASE conexion_app;"

# 4. Initialiser Prisma
npm run db:migrate

# 5. Lancer !
npm run dev
```

---

## 📋 CHECKLIST DE DÉMARRAGE

- [ ] Lire ce guide (DOC_INDEX.md)
- [ ] Lire SETUP_GUIDE.md
- [ ] Installer Node.js et npm
- [ ] Installer MySQL
- [ ] Exécuter `npm install`
- [ ] Configurer .env
- [ ] Créer la base de données
- [ ] Exécuter `npm run db:migrate`
- [ ] Exécuter `npm run dev`
- [ ] ✅ Explorez l'application !

---

## 🎓 APPRENTISSAGE PROGRESSIF

### Jour 1 : Configuration (1-2 heures)
- Suivre SETUP_GUIDE.md
- Faire fonctionner l'application
- Explorer l'interface

### Jour 2 : Architecture (2-3 heures)
- Lire ARCHITECTURE.md
- Explorer le code source
- Comprendre le flux Electron → Renderer

### Jour 3 : Développement (3+ heures)
- Lire ExampleComponent.tsx
- Modifier l'application
- Ajouter de nouvelles features
- Consulter les docs officielles

---

## 🚀 PROCHAINES ÉTAPES APRÈS SETUP

1. **Ajouter une page** : Créer un composant React dans `src/renderer/components/`
2. **Créer un service** : Ajouter une fonction dans `src/api/`
3. **Exposer une API** : Ajouter un handler IPC dans `src/main/events.ts`
4. **Tester** : Appeler depuis le renderer avec `window.electronAPI`
5. **Packager** : Exécuter `npm run package` pour créer l'executable

---

## 📝 NOTATION UTILISÉE

- **✅** = Déjà fait
- **→** = Consultez ce fichier
- **⏱️** = Temps estimé
- **⭐** = Priorité/Importance

---

**Bon développement ! 🎉**

Questions ? Consultez `SETUP_GUIDE.md` ou ouvrez une issue sur GitHub.
