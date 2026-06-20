import { getProducts } from "@/app/actions/products";
import db from "@/lib/db";
import { CategoryView } from "@/components/shop/CategoryView";

export default async function ElectronicaPage() {
  const products = await getProducts({ categorySlug: "electronica" });
  
  // Get category to fetch dynamic filters
  const category = db.prepare("SELECT * FROM Category WHERE slug = ?").get("electronica") as any;
  const filters = category?.filters ? category.filters.split(',').map((f:string) => f.trim()) : [];

  return (
    <CategoryView 
      products={products} 
      filters={filters}
      title="Tech &"
      subtitle="Electrónica"
      description="Los últimos gadgets, auriculares y accesorios tecnológicos de las mejores marcas."
    />
  );
}
