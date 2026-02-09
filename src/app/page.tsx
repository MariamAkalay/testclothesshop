import { getProducts } from '@/lib/airtable';
import ShopContent from './ShopContent';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();

  return <ShopContent products={products} />;
}
