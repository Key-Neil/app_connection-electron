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

-- DropIndex
DROP INDEX `staff_restaurant_id_restaurant_fkey` ON `staff_restaurant`;

-- DropIndex
DROP INDEX `utilisateur_role_id_role_fkey` ON `utilisateur_role`;

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
