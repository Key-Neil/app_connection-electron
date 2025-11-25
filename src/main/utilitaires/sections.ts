const { promises: fs } = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data/sections.json');

async function loadSections(): Promise<any> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

async function saveSections(sections: any): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(sections, null, 2), 'utf-8');
}

async function addSection(restaurantId: number, section: { nom: string; description?: string }): Promise<any> {
  const sections = await loadSections();
  if (!sections[restaurantId]) sections[restaurantId] = [];
  const newSection = { ...section, id: Date.now(), produits: [] };
  sections[restaurantId].push(newSection);
  await saveSections(sections);
  return newSection;
}

async function editSection(restaurantId: number, sectionId: number, updates: { nom?: string; description?: string }): Promise<boolean> {
  const sections = await loadSections();
  const list = sections[restaurantId] || [];
  const idx = list.findIndex((s: any) => s.id === sectionId);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], ...updates };
  await saveSections(sections);
  return true;
}

async function deleteSection(restaurantId: number, sectionId: number): Promise<boolean> {
  const sections = await loadSections();
  if (!sections[restaurantId]) return false;
  const before = sections[restaurantId].length;
  sections[restaurantId] = sections[restaurantId].filter((s: any) => s.id !== sectionId);
  await saveSections(sections);
  return sections[restaurantId].length < before;
}

async function addProduit(restaurantId: number, sectionId: number, produit: any): Promise<any> {
  const sections = await loadSections();
  const list = sections[restaurantId] || [];
  const section = list.find((s: any) => s.id === sectionId);
  if (!section) return null;
  const newProduit = { ...produit, id: Date.now() };
  section.produits.push(newProduit);
  await saveSections(sections);
  return newProduit;
}

async function editProduit(restaurantId: number, sectionId: number, produitId: number, updates: any): Promise<boolean> {
  const sections = await loadSections();
  const list = sections[restaurantId] || [];
  const section = list.find((s: any) => s.id === sectionId);
  if (!section) return false;
  const idx = section.produits.findIndex((p: any) => p.id === produitId);
  if (idx === -1) return false;
  section.produits[idx] = { ...section.produits[idx], ...updates };
  await saveSections(sections);
  return true;
}

async function deleteProduit(restaurantId: number, sectionId: number, produitId: number): Promise<boolean> {
  const sections = await loadSections();
  const list = sections[restaurantId] || [];
  const section = list.find((s: any) => s.id === sectionId);
  if (!section) return false;
  const before = section.produits.length;
  section.produits = section.produits.filter((p: any) => p.id !== produitId);
  await saveSections(sections);
  return section.produits.length < before;
}

module.exports = {
  loadSections,
  saveSections,
  addSection,
  editSection,
  deleteSection,
  addProduit,
  editProduit,
  deleteProduit,
};


