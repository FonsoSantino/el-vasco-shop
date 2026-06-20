import { getProducts } from "@/app/actions/products";
import db from "@/lib/db";
import { CategoryView } from "@/components/shop/CategoryView";

export default async function PerfumeriaPage() {
  const products = await getProducts({ categorySlug: "perfumeria" });
  
  const category = db.prepare("SELECT * FROM Category WHERE slug = ?").get("perfumeria") as any;
  const filters = category?.filters ? category.filters.split(',').map((f:string) => f.trim()) : ['Armaf', 'Afnan', 'Lattafa', 'Al Haramain'];

  return (
    <CategoryView 
      products={products} 
      filters={filters}
      title="Perfumería"
      subtitle="Premium"
      description="Descubre fragancias exclusivas importadas, seleccionadas para dejar una impresión inolvidable."
    />
  );
}
