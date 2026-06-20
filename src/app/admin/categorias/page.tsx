import { getCategories } from "@/app/actions/categories";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryCard } from "@/components/admin/CategoryCard";
import { CreateCategory } from "@/components/admin/CreateCategory";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader 
        title="Gestor de Categorías" 
        description="Administra la información, banners y visibilidad de las categorías principales de la tienda."
      />
      
      <div className="mb-8">
        <CreateCategory />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
