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

-- AlterTable
ALTER TABLE `commande` MODIFY `statut` VARCHAR(191) NOT NULL,
    MODIFY `type_livraison` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `livraison` MODIFY `note_livraison` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `produit` MODIFY `nom` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `restaurant` MODIFY `nom` VARCHAR(191) NOT NULL,
    MODIFY `telephone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `role` MODIFY `nom_role` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `utilisateur` MODIFY `nom` VARCHAR(191) NOT NULL,
    MODIFY `prenom` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `telephone` VARCHAR(191) NULL,
    MODIFY `disponibilite` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `produit` ADD CONSTRAINT `produit_id_restaurant_fkey` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `_EffectuerRole` ADD CONSTRAINT `_EffectuerRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `role`(`id_role`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EffectuerRole` ADD CONSTRAINT `_EffectuerRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RestaurantStaff` ADD CONSTRAINT `_RestaurantStaff_A_fkey` FOREIGN KEY (`A`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RestaurantStaff` ADD CONSTRAINT `_RestaurantStaff_B_fkey` FOREIGN KEY (`B`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;
