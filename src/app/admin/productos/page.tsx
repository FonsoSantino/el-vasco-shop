import Image from "next/image";
import { Package } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { getProducts } from "@/app/actions/products";
import Link from "next/link";
import { ProductActions } from "./ProductActions";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Productos" 
        description="Gestiona el catálogo, inventario y precios de tu tienda."
      />
      <div className="flex justify-end">
        <Link href="/admin/productos/nuevo" className="bg-gold text-black font-bold px-4 py-2 rounded-xl hover:bg-gold-dark transition-colors">
          + Nuevo Producto
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState 
          icon={Package}
          title="No hay productos"
          description="Aún no has agregado ningún producto al catálogo. Comienza creando tu primer producto para empezar a vender."
          actionLabel="Crear mi primer producto"
          actionHref="/admin/productos/nuevo"
        />
      ) : (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-white/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium w-16">Img</th>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded bg-white/5 overflow-hidden relative">
                      {product.imageId ? (
                        <Image src={product.imageId} alt={product.name} fill className="object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                  <td className="px-6 py-4">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-gold">${product.price}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <ProductActions id={product.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
