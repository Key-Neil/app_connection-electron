// ============ CONFIGURATION PRISMA CENTRALISÉE ============
const { PrismaClient } = require('@prisma/client');

let prisma;

/**
 * Récupère l'instance singleton du client Prisma
 * @returns {PrismaClient}
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * Déconnecte le client Prisma
 * @returns {Promise<void>}
 */
async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

module.exports = {
  getPrismaClient,
  disconnectPrisma,
};
