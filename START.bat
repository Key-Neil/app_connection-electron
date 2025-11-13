@echo off
REM Windows Batch version du script de démarrage

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🍔 Connextion App - Script de démarrage rapide        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📦 Étape 1: Installer les dépendances...
echo    npm install
echo.

echo 🗄️  Étape 2: Créer la base de données MySQL
echo    Exécutez dans MySQL Workbench:
echo    CREATE DATABASE conexion_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.

echo ⚙️  Étape 3: Initialiser Prisma
echo    npm run prisma:generate
echo    npm run db:migrate
echo    npm run db:seed
echo.

echo 🎮 Étape 4: Lancer l'application
echo    npm run dev
echo.

echo 📖 Documentation disponible:
echo    - DOC_INDEX.md ^(lisez d'abord^)
echo    - SETUP_GUIDE.md ^(installation^)
echo    - QUICKSTART.md ^(rapide^)
echo    - ARCHITECTURE.md ^(détails^)
echo    - README.md ^(complet^)
echo.

echo 💡 Commandes utiles:
echo    npm run dev              - Développement avec hot reload
echo    npm run build            - Compiler le code
echo    npm run package          - Créer l'executable
echo    npm run lint             - Vérifier le code
echo    npm run format           - Formater le code
echo.

echo ✨ C'est prêt ! Commencez par :
echo    1. Lire DOC_INDEX.md
echo    2. Suivre SETUP_GUIDE.md
echo    3. Exécuter npm install
echo    4. Lancer npm run dev
echo.

pause
