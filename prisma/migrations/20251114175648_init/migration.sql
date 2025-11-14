CREATE TABLE `utilisateur` (
    `id_utilisateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(20) NOT NULL,
    `prenom` VARCHAR(20) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `mot_de_passe_hash` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(20) NULL,
    `adresse_livraison_default` VARCHAR(191) NULL,
    `disponibilite` VARCHAR(20) NULL,
    `position_lat` DOUBLE NULL,
    `position_lon` DOUBLE NULL,

    UNIQUE INDEX `utilisateur_email_key`(`email`),
    UNIQUE INDEX `utilisateur_telephone_key`(`telephone`),
    PRIMARY KEY (`id_utilisateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `role` (
    `id_role` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_role` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `role_nom_role_key`(`nom_role`),
    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `restaurant` (
    `id_restaurant` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(20) NOT NULL,
    `adresse` VARCHAR(191) NULL,
    `telephone` VARCHAR(20) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,

    PRIMARY KEY (`id_restaurant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `produit` (
    `id_produit` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(20) NOT NULL,
    `prix` DOUBLE NOT NULL,
    `description` VARCHAR(100) NULL,
    `url_photo` VARCHAR(191) NULL,
    `prix_promo` DOUBLE NULL,
    `id_restaurant` INTEGER NOT NULL,

    PRIMARY KEY (`id_produit`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `commande` (
    `id_commande` INTEGER NOT NULL AUTO_INCREMENT,
    `date_commande` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` VARCHAR(20) NOT NULL,
    `type_livraison` VARCHAR(20) NULL,
    `temps_preparation_estime_min` INTEGER NULL,
    `frais_livraison` DOUBLE NULL DEFAULT 0,
    `id_client` INTEGER NOT NULL,
    `id_restaurant` INTEGER NOT NULL,

    PRIMARY KEY (`id_commande`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `detail_commande` (
    `id_detail_commande` INTEGER NOT NULL AUTO_INCREMENT,
    `quantite` INTEGER NOT NULL,
    `prix_unitaire` DOUBLE NOT NULL,
    `id_commande` INTEGER NOT NULL,
    `id_produit` INTEGER NOT NULL,

    PRIMARY KEY (`id_detail_commande`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `livraison` (
    `id_livraison` INTEGER NOT NULL AUTO_INCREMENT,
    `statut_livraison` VARCHAR(50) NOT NULL DEFAULT 'En attente assignation',
    `note_livraison` VARCHAR(100) NULL,
    `heure_acceptation` DATETIME(3) NULL,
    `heure_recuperation` DATETIME(3) NULL,
    `heure_livraison_effective` DATETIME(3) NULL,
    `id_commande` INTEGER NOT NULL,
    `id_livreur` INTEGER NULL,

    UNIQUE INDEX `livraison_id_commande_key`(`id_commande`),
    PRIMARY KEY (`id_livraison`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `_EffectuerRole` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EffectuerRole_AB_unique`(`A`, `B`),
    INDEX `_EffectuerRole_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `_RestaurantStaff` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RestaurantStaff_AB_unique`(`A`, `B`),
    INDEX `_RestaurantStaff_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `produit` ADD CONSTRAINT `produit_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `commande` ADD CONSTRAINT `commande_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `commande` ADD CONSTRAINT `commande_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `detail_commande` ADD CONSTRAINT `detail_commande_id_commande_fkey` FOREIGN KEY (`id_commande`) REFERENCES `commande`(`id_commande`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `detail_commande` ADD CONSTRAINT `detail_commande_id_produit_fkey` FOREIGN KEY (`id_produit`) REFERENCES `produit`(`id_produit`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `livraison` ADD CONSTRAINT `livraison_id_commande_fkey` FOREIGN KEY (`id_commande`) REFERENCES `commande`(`id_commande`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `livraison` ADD CONSTRAINT `livraison_id_livreur_fkey` FOREIGN KEY (`id_livreur`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `_EffectuerRole` ADD CONSTRAINT `_EffectuerRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `role`(`id_role`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `_EffectuerRole` ADD CONSTRAINT `_EffectuerRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `_RestaurantStaff` ADD CONSTRAINT `_RestaurantStaff_A_fkey` FOREIGN KEY (`A`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `_RestaurantStaff` ADD CONSTRAINT `_RestaurantStaff_B_fkey` FOREIGN KEY (`B`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;
