# Refactorisation du Schéma - Normalisation Boyce-Codd

## 📅 Date
24 novembre 2024

## 🎯 Objectif
Refactoriser le schéma de base de données pour le rendre conforme aux normes SQL strictes (Forme Normale de Boyce-Codd) en remplaçant les relations implicites de Prisma par des tables de jonction explicites.

## ⚡ Changements Effectués

### 1. Schema Prisma (`schema.prisma`)

#### Modèle Utilisateur
**Avant:**
```prisma
model Utilisateur {
  roles Role[] @relation("EffectuerRole")
  restaurants_staff Restaurant[] @relation("RestaurantStaff")
}
```

**Après:**
```prisma
model Utilisateur {
  utilisateur_roles UtilisateurRole[]
  staff_restaurants StaffRestaurant[]
}
```

#### Nouveaux Modèles de Jonction

**UtilisateurRole:**
```prisma
model UtilisateurRole {
  id_utilisateur Int
  id_role        Int
  
  utilisateur Utilisateur @relation(fields: [id_utilisateur], references: [id_utilisateur], onDelete: Cascade)
  role        Role        @relation(fields: [id_role], references: [id_role], onDelete: Cascade)
  
  @@id([id_utilisateur, id_role])
  @@map("utilisateur_role")
}
```

**StaffRestaurant:**
```prisma
model StaffRestaurant {
  id_utilisateur Int
  id_restaurant  Int
  
  utilisateur Utilisateur @relation(fields: [id_utilisateur], references: [id_utilisateur], onDelete: Cascade)
  restaurant  Restaurant  @relation(fields: [id_restaurant], references: [id_restaurant], onDelete: Cascade)
  
  @@id([id_utilisateur, id_restaurant])
  @@map("staff_restaurant")
}
```

### 2. Migration SQL

**Créée:** `20251124233832_refactor_explicit_relations`

**Actions:**
- Suppression de `_effectuerrole` (table implicite)
- Suppression de `_restaurantstaff` (table implicite)
- Création de `utilisateur_role` avec clé primaire composite
- Création de `staff_restaurant` avec clé primaire composite
- Ajout de contraintes de clé étrangère avec `ON DELETE CASCADE`

### 3. Code Backend (`main.ts`)

**Modifications des requêtes Prisma:**

#### Inclusion de rôles:
```typescript
// Avant
include: { roles: true }

// Après
include: { utilisateur_roles: { include: { role: true } } }
```

#### Mapping des rôles:
```typescript
// Avant
user.roles.map(r => r.nom_role)

// Après
user.utilisateur_roles.map(ur => ur.role.nom_role)
```

#### Attribution de rôles:
```typescript
// Avant
await prisma.utilisateur.update({
  where: { id_utilisateur },
  data: { roles: { connect: { id_role: 1 } } }
})

// Après
await prisma.utilisateurRole.create({
  data: { id_utilisateur, id_role: 1 }
})
```

#### Mise à jour de rôles:
```typescript
// Avant
await prisma.utilisateur.update({
  data: { roles: { set: [], connect: roleConnect } }
})

// Après
await prisma.utilisateurRole.deleteMany({ where: { id_utilisateur } })
await prisma.utilisateurRole.createMany({ data: rolesData })
```

#### Filtrage staff restaurants:
```typescript
// Avant
where: { staff: { some: { id_utilisateur } } }

// Après
where: { staff_restaurants: { some: { id_utilisateur } } }
```

#### Suppression d'affectation:
```typescript
// Avant
await prisma.restaurant.update({
  data: { staff: { disconnect: { id_utilisateur } } }
})

// Après
await prisma.staffRestaurant.delete({
  where: { 
    id_utilisateur_id_restaurant: { id_utilisateur, id_restaurant }
  }
})
```

### 4. Seed Script (`seed.ts`)

**Pattern utilisé pour les jonctions:**

```typescript
const admin = await prisma.utilisateur.upsert({ ... })

await prisma.utilisateurRole.upsert({
  where: { id_utilisateur_id_role: { id_utilisateur: admin.id_utilisateur, id_role: 1 } },
  update: {},
  create: { id_utilisateur: admin.id_utilisateur, id_role: 1 }
})
```

**Pour staff et restaurants:**
```typescript
await prisma.staffRestaurant.upsert({
  where: { 
    id_utilisateur_id_restaurant: { 
      id_utilisateur: cook.id_utilisateur, 
      id_restaurant: restaurant1.id_restaurant 
    }
  },
  update: {},
  create: { id_utilisateur: cook.id_utilisateur, id_restaurant: restaurant1.id_restaurant }
})
```

### 5. Nettoyage du Code

**Suppressions effectuées:**
- Tous les commentaires supprimés de `main.ts` (72 lignes de commentaires)
- Code condensé et épuré
- Backup créé: `main_with_comments.ts.bak`

## ✅ Avantages de cette Refactorisation

### 1. Clarté SQL
- Tables avec noms explicites et sémantiques
- Colonnes nommées clairement (`id_utilisateur`, `id_role`) au lieu de `A`, `B`
- Structure visible dans les outils d'administration MySQL

### 2. Conformité Normalization
- Respect de la Forme Normale de Boyce-Codd (FNBC)
- Pas de dépendances transitives
- Clés primaires composites garantissent l'unicité

### 3. Maintenabilité
- Requêtes plus explicites dans le code
- Facile à comprendre les relations many-to-many
- Documentation self-service via les noms de tables

### 4. Intégrité Référentielle
- `ON DELETE CASCADE` automatique
- Pas d'orphelins dans les tables de jonction
- Cohérence des données garantie

### 5. Performance
- Index automatiques sur les clés primaires composites
- Requêtes optimisées par le SGBD
- Jointures efficaces

## 🔍 Validation

### Tests Effectués:
- ✅ Migration appliquée sans erreur
- ✅ Prisma Client régénéré (v5.22.0)
- ✅ Aucune erreur TypeScript dans main.ts
- ✅ Aucune erreur TypeScript dans seed.ts
- ✅ Structure de base de données conforme

### Commandes de Validation:
```bash
npx prisma migrate dev    # Migration réussie
npx prisma generate       # Client Prisma généré
npm run build             # Compilation TypeScript réussie
```

## 📝 Fichiers Modifiés

1. `prisma/schema.prisma` - Ajout de UtilisateurRole et StaffRestaurant
2. `src/main/main.ts` - Mise à jour de toutes les requêtes Prisma
3. `prisma/seed.ts` - Adaptation du script de seed
4. `README.md` - Documentation des changements
5. `prisma/migrations/20251124233832_refactor_explicit_relations/` - Migration SQL

## 🎓 Leçons Apprises

### Relations Implicites Prisma
- Pratiques pour le prototypage rapide
- Génèrent des tables avec noms génériques (`_effectuerrole`)
- Colonnes `A` et `B` peu lisibles en SQL pur

### Relations Explicites
- Nécessitent plus de code au départ
- Offrent un contrôle total sur la structure
- Conformes aux standards SQL et bases de données

### Pattern de Refactorisation
1. Créer les nouveaux modèles de jonction
2. Générer la migration
3. Mettre à jour le code métier
4. Mettre à jour les scripts de seed
5. Tester toutes les fonctionnalités

## 🚀 Prochaines Étapes

1. Tester l'application end-to-end
2. Vérifier toutes les fonctionnalités utilisateur
3. Valider les autorisations par rôle
4. Tester les opérations CRUD sur les jonctions
5. Documenter les patterns dans le guide développeur

## 📚 Références

- [Prisma - Explicit Many-to-Many Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/many-to-many-relations#explicit-many-to-many-relations)
- [Boyce-Codd Normal Form (BCNF)](https://en.wikipedia.org/wiki/Boyce%E2%80%93Codd_normal_form)
- [SQL Composite Primary Keys](https://www.mysqltutorial.org/mysql-composite-key/)

---

**Refactorisation terminée avec succès ✅**
