# Application de Livraison (Electron + Prisma)

Application de gestion de livraison de repas (Clients, Restaurants, Livreurs) construite avec Electron, Node.js et Prisma (MySQL).

## 📋 Prérequis

* Node.js (v16 ou supérieur)
* MySQL (Serveur local lancé)
* Git

## 🚀 Installation

1.  **Cloner le projet**
    ```bash
    git clone <https://github.com/Key-Neil/app_connection-electron>
    cd app_connection-electron
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configuration de la Base de Données**
    * Créez un fichier `.env` à la racine s'il n'existe pas.
    * Ajoutez votre URL de connexion MySQL :
        `DATABASE_URL="mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/app_connection"`

4.  **Initialiser la Base de Données**
    Ceci va créer les tables et insérer les données de test (Admin, Restaurants, Menus).
    ```bash
    npx prisma db push
    npx prisma db seed
    ```

## ▶️ Lancer l'application

```bash
npm start