DROP TABLE IF EXISTS detail_commande;
DROP TABLE IF EXISTS restaurant_staff;
DROP TABLE IF EXISTS effectuer_role;
DROP TABLE IF EXISTS livraison;
DROP TABLE IF EXISTS commande;
DROP TABLE IF EXISTS produit;
DROP TABLE IF EXISTS restaurant;
DROP TABLE IF EXISTS utilisateur;
DROP TABLE IF EXISTS role;

-- 1. Tables de base sans dépendances
CREATE TABLE role (
    id_role INT PRIMARY KEY AUTO_INCREMENT,
    nom_role VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE utilisateur (
    id_utilisateur INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) UNIQUE,
    adresse_livraison_default VARCHAR(100),
    disponibilite VARCHAR(50),
    position_lat DECIMAL(10, 8),
    position_lon DECIMAL(11, 8)
);

CREATE TABLE restaurant (
    id_restaurant INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    adresse VARCHAR(100),
    telephone VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- 2. Tables dépendantes
CREATE TABLE produit (
    id_produit INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    description TEXT,
    url_photo VARCHAR(255),
    prix_promo DECIMAL(10, 2),
    id_restaurant INT NOT NULL,
    FOREIGN KEY (id_restaurant) REFERENCES restaurant(id_restaurant) ON DELETE CASCADE
);

CREATE TABLE commande (
    id_commande INT PRIMARY KEY AUTO_INCREMENT,
    date_commande DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) NOT NULL,
    type_livraison VARCHAR(50),
    temps_preparation_estime_min INT,
    frais_livraison DECIMAL(5, 2) DEFAULT 0,
    id_client INT NOT NULL,
    id_restaurant INT NOT NULL,
    FOREIGN KEY (id_client) REFERENCES utilisateur(id_utilisateur),
    FOREIGN KEY (id_restaurant) REFERENCES restaurant(id_restaurant)
);

CREATE TABLE livraison (
    id_livraison INT PRIMARY KEY AUTO_INCREMENT,
    id_commande INT NOT NULL UNIQUE,
    id_livreur INT,
    statut_livraison VARCHAR(50) NOT NULL DEFAULT 'En attente assignation',
    note_livraison VARCHAR(50),
    heure_acceptation DATETIME,
    heure_recuperation DATETIME,
    heure_livraison_effective DATETIME,
    FOREIGN KEY (id_commande) REFERENCES commande(id_commande) ON DELETE CASCADE,
    FOREIGN KEY (id_livreur) REFERENCES utilisateur(id_utilisateur)
);

-- 3. Tables de liaison (Many-to-Many)
CREATE TABLE effectuer_role (
    id_utilisateur INT NOT NULL,
    id_role INT NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_role) REFERENCES role(id_role) ON DELETE CASCADE,
    PRIMARY KEY (id_utilisateur, id_role)
);

CREATE TABLE restaurant_staff (
    id_utilisateur INT NOT NULL,
    id_restaurant INT NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_restaurant) REFERENCES restaurant(id_restaurant) ON DELETE CASCADE,
    PRIMARY KEY (id_utilisateur, id_restaurant)
);

CREATE TABLE detail_commande (
    id_detail_commande INT PRIMARY KEY AUTO_INCREMENT,
    id_commande INT NOT NULL,
    id_produit INT NOT NULL,
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_commande) REFERENCES commande(id_commande) ON DELETE CASCADE,
    FOREIGN KEY (id_produit) REFERENCES produit(id_produit)
);

-- 4. Insertion des rôles de base
INSERT INTO role (nom_role) VALUES ('Client'), ('Livreur'), ('Employe'), ('Admin');