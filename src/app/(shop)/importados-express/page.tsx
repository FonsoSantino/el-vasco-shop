import { getProducts } from "@/app/actions/products";
import db from "@/lib/db";
import { CategoryView } from "@/components/shop/CategoryView";

export default async function ImportadosExpressPage() {
  const products = await getProducts({ categorySlug: "importados-express" });
  
  // Get category to fetch dynamic filters
  const category = db.prepare("SELECT * FROM Category WHERE slug = ?").get("importados-express") as any;
  const filters = category?.filters ? category.filters.split(',').map((f:string) => f.trim()) : ['Ropa', 'Accesorios', 'Calzado', 'Otros'];

  return (
    <CategoryView 
      products={products} 
      filters={filters}
      title="Importados"
      subtitle="Express"
      description="Productos exclusivos traídos directamente para ti. Ropa, calzado y accesorios de las mejores marcas del mundo."
    />
  );
}
