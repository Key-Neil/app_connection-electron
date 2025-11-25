# 🚀 Keynect - Résumé pour l'oral (2 minutes)

## 🎯 Concept
Application de livraison de repas Electron avec gestion multi-rôles (Client, Cuisinier, Livreur, Admin).

## 🛠️ Stack technique
- **Electron 31** : Desktop app
- **Prisma 5** : ORM MySQL
- **TypeScript** : Typage statique
- **bcryptjs** : Sécurité des mots de passe

## 📁 Architecture simplifiée

```
src/main/main.ts          ← TOUT le backend (800 lignes)
	↓
Prisma ORM
	↓
MySQL (app_connection)
```

**Pattern :** Frontend → IPC → Backend → Prisma → MySQL

## 🗄️ Base de données (10 tables)

Modèles principaux :
- **Utilisateur** (avec rôles)
- **Restaurant** → **SectionMenu** → **Produit**
- **Commande** ↔ **DetailCommande** ↔ **Produit**
- **Livraison** (one-to-one avec Commande)

Relations Many-to-Many explicites : `UtilisateurRole`, `StaffRestaurant`, `DetailCommande`

## ✨ Fonctionnalités principales

### Client
✅ Inscription/Connexion  
✅ Navigation restaurants  
✅ Panier + Commande  
✅ Historique

### Cuisinier
✅ Voir commandes de ses restaurants  
✅ Changer statut (En préparation → Prête)

### Livreur
✅ Voir commandes disponibles  
✅ Accepter livraison  
✅ Mettre à jour statut (En cours → Livrée)

### Admin
✅ CRUD restaurants complet  
✅ CRUD menus (sections + produits)  
✅ Gestion utilisateurs + rôles  
✅ Vue globale commandes

## 🔐 Sécurité

- **Mots de passe** : Hachés bcrypt (10 rounds)
- **Vérification rôles** : Sur chaque action sensible
- **IPC sécurisé** : contextIsolation + preload
- **Try/Catch** : Sur tous les handlers asynchrones

## 🎓 Points forts pour l'oral

1. **Architecture linéaire** : "Tout dans main.ts pour faciliter la lecture"
2. **Migration unique** : "Une seule migration `init` au lieu de 8 fragmentées"
3. **Relations explicites** : "Tables de jointure claires (pas d'implicite)"
4. **Sécurité** : "Hachage bcrypt + vérification des permissions"
5. **IPC Electron** : "Communication sécurisée renderer ↔ main"

## 📊 Chiffres clés

- 40+ handlers IPC
- 10 modèles Prisma
- 1 migration propre
- 800 lignes main.ts
- 4 rôles système

## 🚀 Démo rapide

1. Login : `admin@keynect.com` / `admin123`
2. Panel Admin → Restaurants (CRUD)
3. Panel Admin → Menus (sections + produits)
4. Panel Admin → Commandes (toutes)
5. Panel Admin → Utilisateurs (rôles)

## 💡 Phrase d'accroche

> "J'ai simplifié l'architecture en consolidant tout le backend dans un seul fichier `main.ts`, ce qui permet de lire le code de manière linéaire et de comprendre facilement le flux de données depuis la requête IPC jusqu'à la base de données MySQL via Prisma."

---

**Temps de présentation estimé : 2-3 minutes**  
**Documentation complète : GUIDE_ORAL.md**
