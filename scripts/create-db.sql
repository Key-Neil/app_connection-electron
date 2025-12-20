-- ============================================================
-- Script de création de la base de données app_connection
-- ============================================================

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS app_connection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sélectionner la base de données
USE app_connection;

-- Afficher un message de confirmation
SELECT 'Base de données app_connection créée avec succès !' AS message;

-- Note: Les tables seront créées par Prisma avec la commande:
-- npx prisma db push
