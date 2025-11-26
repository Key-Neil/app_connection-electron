-- CreateTable
CREATE TABLE `Utilisateurs` (
    `id_utilisateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(50) NULL,
    `prenom` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `mot_de_passe_hash` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `Utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id_utilisateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `id_role` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_role` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Roles_nom_role_key`(`nom_role`),
    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Utilisateurs_Roles` (
    `id_utilisateur` INTEGER NOT NULL,
    `id_role` INTEGER NOT NULL,

    PRIMARY KEY (`id_utilisateur`, `id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restaurants` (
    `id_restaurant` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `adresse` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(20) NOT NULL,
    `latitude` DOUBLE NOT NULL DEFAULT 48.8566,
    `longitude` DOUBLE NOT NULL DEFAULT 2.3522,

    PRIMARY KEY (`id_restaurant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Staff_Restaurants` (
    `id_utilisateur` INTEGER NOT NULL,
    `id_restaurant` INTEGER NOT NULL,

    PRIMARY KEY (`id_utilisateur`, `id_restaurant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produits` (
    `id_produit` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `prix` DOUBLE NOT NULL,
    `description` TEXT NULL,
    `url_photo` VARCHAR(255) NULL,
    `prix_promo` DOUBLE NULL,
    `id_restaurant` INTEGER NOT NULL,

    PRIMARY KEY (`id_produit`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commandes` (
    `id_commande` INTEGER NOT NULL AUTO_INCREMENT,
    `date_commande` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` VARCHAR(50) NOT NULL DEFAULT 'En attente',
    `id_client` INTEGER NOT NULL,
    `id_restaurant` INTEGER NOT NULL,

    PRIMARY KEY (`id_commande`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Details_Commande` (
    `id_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `id_commande` INTEGER NOT NULL,
    `id_produit` INTEGER NOT NULL,
    `quantite` INTEGER NOT NULL,
    `prix_unitaire` DOUBLE NOT NULL,

    PRIMARY KEY (`id_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Livraisons` (
    `id_livraison` INTEGER NOT NULL AUTO_INCREMENT,
    `id_commande` INTEGER NOT NULL,
    `id_livreur` INTEGER NOT NULL,
    `statut_livraison` VARCHAR(50) NOT NULL DEFAULT 'En attente',
    `heure_acceptation` DATETIME(3) NULL,
    `heure_livraison_effective` DATETIME(3) NULL,

    UNIQUE INDEX `Livraisons_id_commande_key`(`id_commande`),
    PRIMARY KEY (`id_livraison`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Utilisateurs_Roles` ADD CONSTRAINT `Utilisateurs_Roles_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateurs`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Utilisateurs_Roles` ADD CONSTRAINT `Utilisateurs_Roles_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `Roles`(`id_role`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Staff_Restaurants` ADD CONSTRAINT `Staff_Restaurants_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `Utilisateurs`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Staff_Restaurants` ADD CONSTRAINT `Staff_Restaurants_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `Restaurants`(`id_restaurant`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produits` ADD CONSTRAINT `Produits_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `Restaurants`(`id_restaurant`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commandes` ADD CONSTRAINT `Commandes_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Utilisateurs`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commandes` ADD CONSTRAINT `Commandes_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `Restaurants`(`id_restaurant`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Details_Commande` ADD CONSTRAINT `Details_Commande_id_commande_fkey` FOREIGN KEY (`id_commande`) REFERENCES `Commandes`(`id_commande`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Details_Commande` ADD CONSTRAINT `Details_Commande_id_produit_fkey` FOREIGN KEY (`id_produit`) REFERENCES `Produits`(`id_produit`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Livraisons` ADD CONSTRAINT `Livraisons_id_commande_fkey` FOREIGN KEY (`id_commande`) REFERENCES `Commandes`(`id_commande`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Livraisons` ADD CONSTRAINT `Livraisons_id_livreur_fkey` FOREIGN KEY (`id_livreur`) REFERENCES `Utilisateurs`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;
