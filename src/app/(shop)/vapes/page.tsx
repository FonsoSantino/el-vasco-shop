import { getProducts } from "@/app/actions/products";
import db from "@/lib/db";
import { CategoryView } from "@/components/shop/CategoryView";

export default async function VapesPage() {
  const products = await getProducts({ categorySlug: "vapes" });
  
  // Get category to fetch dynamic filters
  const category = db.prepare("SELECT * FROM Category WHERE slug = ?").get("vapes") as any;
  const filters = category?.filters ? category.filters.split(',').map((f:string) => f.trim()) : [];

  return (
    <CategoryView 
      products={products} 
      filters={filters}
      title="Vapes"
      subtitle="Descartables"
      description="La mejor tecnología en vaporizadores descartables con sabores intensos y duraderos."
    />
  );
}
