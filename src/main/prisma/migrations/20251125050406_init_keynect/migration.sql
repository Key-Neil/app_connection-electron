-- DropIndex
DROP INDEX `Commandes_id_client_fkey` ON `commandes`;

-- DropIndex
DROP INDEX `Commandes_id_restaurant_fkey` ON `commandes`;

-- DropIndex
DROP INDEX `Details_Commande_id_commande_fkey` ON `details_commande`;

-- DropIndex
DROP INDEX `Details_Commande_id_produit_fkey` ON `details_commande`;

-- DropIndex
DROP INDEX `Livraisons_id_livreur_fkey` ON `livraisons`;

-- DropIndex
DROP INDEX `Produits_id_restaurant_fkey` ON `produits`;

-- DropIndex
DROP INDEX `Staff_Restaurants_id_restaurant_fkey` ON `staff_restaurants`;

-- DropIndex
DROP INDEX `Utilisateurs_Roles_id_role_fkey` ON `utilisateurs_roles`;

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
