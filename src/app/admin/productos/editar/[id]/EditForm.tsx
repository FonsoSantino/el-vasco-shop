"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProduct } from "@/app/actions/products";
import Image from "next/image";
import { FlavorManager } from "@/components/admin/FlavorManager";

interface EditProductProps {
  product: {
    id: string;
    name: string;
    description?: string;
    imageId?: string;
    price: number;
    discount?: number;
    sku?: string;
    stock?: number;
    status?: string;
    isFeatured?: boolean | number;
    isSpecialOrder?: boolean | number;
    categorySlug?: string;
    flavors?: string;
    brand?: { name?: string };
  };
}

export default function EditForm({ product }: EditProductProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(product.categorySlug || "");

  // Marcas dinámicas
  const brandsByCategory: Record<string, string[]> = {
    perfumeria: ["Armaf", "Afnan", "Lattafa", "Al Haramain"],
    vapes: ["Elfbar", "Ignite"],
    electronica: ["Apple", "Samsung", "Xiaomi", "Sony", "JBL"],
  };

  const currentBrands = brandsByCategory[selectedCategory] || [];

  const handleAction = async (formData: FormData) => {
    setIsSubmitting(true);
    const result = await updateProduct(product.id, formData);
    
    if (result.success) {
      router.push("/admin/productos");
    } else {
      alert("Error al guardar: " + result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleAction} className="flex flex-col h-full relative pb-24">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Producto</h1>
            <p className="text-white/50 text-sm">Modifica la información de tu producto.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tarjeta: Información Básica */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Nombre del producto *</label>
                <input required name="name" defaultValue={product.name} type="text" placeholder="Ej. iPhone 15 Pro Max 256GB" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Descripción</label>
                <textarea name="description" defaultValue={product.description || ""} rows={4} placeholder="Describe el producto detalladamente..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
              </div>
              
              {/* Dynamic Fields — Vapes */}
              {selectedCategory === "vapes" && (
                <div className="pt-5 border-t border-white/10">
                  <FlavorManager defaultValue={product.flavors || ""} />
                </div>
              )}
              {selectedCategory === "perfumeria" && (
                <div className="pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Concentración</label>
                    <select name="concentration" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none">
                      <option value="EDP">Eau de Parfum (EDP)</option>
                      <option value="EDT">Eau de Toilette (EDT)</option>
                      <option value="Parfum">Parfum</option>
                      <option value="Extrait">Extrait de Parfum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Género</label>
                    <select name="gender" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none">
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Volumen</label>
                    <input name="volume" type="text" placeholder="Ej. 100ml" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
                  </div>
                </div>
              )}
              {selectedCategory === "electronica" && (
                <div className="pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-white/70 mb-2">Especificaciones Técnicas</label>
                  <textarea name="specifications" defaultValue={(product as any).specifications || ""} rows={4} placeholder="Pantalla: 6.7 OLED... Batería: 5000mAh..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta: Multimedia */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Multimedia</h2>
            
            {product.imageId && (
               <div className="mb-4">
                 <p className="text-sm text-white/70 mb-2">Imagen Actual:</p>
                 <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-white/5">
                   <Image src={product.imageId} alt="Current" fill className="object-cover" />
                 </div>
               </div>
            )}

            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors relative min-h-[200px] overflow-hidden">
              <input 
                type="file" 
                name="images" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const previewUrl = URL.createObjectURL(files[0]);
                    const previewDiv = document.getElementById("image-preview");
                    const iconDiv = document.getElementById("upload-icon");
                    if (previewDiv && iconDiv) {
                      previewDiv.style.backgroundImage = `url(${previewUrl})`;
                      iconDiv.style.opacity = "0";
                    }
                  }
                }}
              />
              <div id="image-preview" className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 z-0"></div>
              <div id="upload-icon" className="flex flex-col items-center z-0 transition-opacity">
                <UploadCloud className="w-8 h-8 text-white/40 mb-3" />
                <p className="text-sm font-medium mb-1">Haz clic para subir nueva imagen (reemplaza actual)</p>
                <p className="text-xs text-white/40">Soporta PNG, JPG, WEBP (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Tarjeta: Precios e Inventario */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Precios e Inventario</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Precio Regular ($) *</label>
                <input required name="price" defaultValue={product.price} type="number" step="0.01" placeholder="0.00" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Precio Anterior (Opcional)</label>
                <input name="discount" defaultValue={product.discount || ""} type="number" step="0.01" placeholder="0.00" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">SKU</label>
                <input name="sku" defaultValue={product.sku || ""} type="text" placeholder="Ej. ELV-12345" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Stock Disponible *</label>
                <input required name="stock" defaultValue={product.stock} type="number" placeholder="0" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Secundaria (Sidebar del form) */}
        <div className="space-y-8">
          {/* Tarjeta: Organización */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Organización</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Estado</label>
                <select name="status" defaultValue={product.status || "ACTIVE"} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none">
                  <option value="ACTIVE">Activo</option>
                  <option value="DRAFT">Borrador</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </div>
              <div className="pt-2 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked={product.isFeatured === 1} name="isFeatured" value="true" className="w-5 h-5 rounded border-white/20 bg-black/50 text-gold focus:ring-gold focus:ring-offset-black" />
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Producto Destacado</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked={product.isSpecialOrder === 1} name="isSpecialOrder" value="true" className="w-5 h-5 rounded border-white/20 bg-black/50 text-purple-400 focus:ring-purple-400 focus:ring-offset-black" />
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Producto por Encargo</span>
                </label>
                <p className="text-xs text-white/40">Este producto se marcará como pedido especial y se mostrará en Importados Express.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Categoría *</label>
                <select 
                  name="categoryId" 
                  required
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="perfumeria">Perfumería</option>
                  <option value="vapes">Vapes</option>
                  <option value="electronica">Electrónica</option>
                  <option value="importados-express">Importados Express</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Marca (Se creará si no existe)</label>
                <input 
                  name="brandName" 
                  defaultValue={product.brand?.name || ""}
                  list="brand-options" 
                  autoComplete="off"
                  placeholder="Ej. Ignite, Armaf..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" 
                />
                <datalist id="brand-options">
                  {currentBrands.map(brand => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 p-4 flex items-center justify-between z-20 px-8">
        <Button type="button" variant="ghost" onClick={() => router.back()} className="text-white/60 hover:text-white">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-gold text-black hover:bg-gold-dark font-bold rounded-full px-8">
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          {!isSubmitting && <Save className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </form>
  );
}
