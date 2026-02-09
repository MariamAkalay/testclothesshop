import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

export interface Product {
  id: string;
  nom: string;
  prix: number;
  image: string;
  disponibilite: string;
  categorie: string;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const records = await base('Vêtements')
      .select({
        view: 'Grid view',
        filterByFormula: "{Nom} != ''",
      })
      .all();

    return records.map((record) => {
      const fields = record.fields;
      const imageField = fields.image as readonly { url: string }[] | undefined;
      return {
        id: record.id,
        nom: (fields.nom as string) || '',
        prix: (fields.prix as number) || 0,
        image: imageField?.[0]?.url || '',
        disponibilite: (fields.disponibilite as string) || 'Disponible',
        categorie: (fields.categorie as string) || 'Autre',
      };
    });
  } catch (error) {
    console.error('Error fetching products from Airtable:', error);
    return [];
  }
}

export async function getCategories(): Promise<string[]> {
  const products = await getProducts();
  const categories = [...new Set(products.map((p) => p.categorie))];
  return categories.sort();
}
