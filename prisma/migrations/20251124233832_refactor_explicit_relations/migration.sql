/*
  Warnings:

  - You are about to drop the `_effectuerrole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_restaurantstaff` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `commande_id_client_fkey` ON `commande`;

-- DropIndex
DROP INDEX `commande_id_restaurant_fkey` ON `commande`;

-- DropIndex
DROP INDEX `detail_commande_id_commande_fkey` ON `detail_commande`;

-- DropIndex
DROP INDEX `detail_commande_id_produit_fkey` ON `detail_commande`;

-- DropIndex
DROP INDEX `livraison_id_livreur_fkey` ON `livraison`;

-- DropIndex
DROP INDEX `produit_id_restaurant_fkey` ON `produit`;

-- DropIndex
DROP INDEX `produit_id_section_fkey` ON `produit`;

-- DropIndex
DROP INDEX `section_menu_id_restaurant_fkey` ON `section_menu`;

-- DropTable
DROP TABLE `_effectuerrole`;

-- DropTable
DROP TABLE `_restaurantstaff`;

-- CreateTable
CREATE TABLE `utilisateur_role` (
    `id_utilisateur` INTEGER NOT NULL,
    `id_role` INTEGER NOT NULL,

    PRIMARY KEY (`id_utilisateur`, `id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_restaurant` (
    `id_utilisateur` INTEGER NOT NULL,
    `id_restaurant` INTEGER NOT NULL,

    PRIMARY KEY (`id_utilisateur`, `id_restaurant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `utilisateur_role` ADD CONSTRAINT `utilisateur_role_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utilisateur_role` ADD CONSTRAINT `utilisateur_role_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `role`(`id_role`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_restaurant` ADD CONSTRAINT `staff_restaurant_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_restaurant` ADD CONSTRAINT `staff_restaurant_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `section_menu` ADD CONSTRAINT `section_menu_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produit` ADD CONSTRAINT `produit_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produit` ADD CONSTRAINT `produit_id_section_fkey` FOREIGN KEY (`id_section`) REFERENCES `section_menu`(`id_section`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commande` ADD CONSTRAINT `commande_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commande` ADD CONSTRAINT `commande_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_commande` ADD CONSTRAINT `detail_commande_id_commande_fkey` FOREIGN KEY (`id_commande`) REFERENCES `commande`(`id_commande`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_commande` ADD CONSTRAINT `detail_commande_id_produit_fkey` FOREIGN KEY (`id_produit`) REFERENCES `produit`(`id_produit`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `livraison` ADD CONSTRAINT `livraison_id_commande_fkey` FOREIGN KEY (`id_commande`) REFERENCES `commande`(`id_commande`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `livraison` ADD CONSTRAINT `livraison_id_livreur_fkey` FOREIGN KEY (`id_livreur`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE;
