"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCategory } from "@/app/actions/categories";

export default function NuevaCategoriaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (formData: FormData) => {
    setIsSubmitting(true);
    const result = await createCategory(formData);
    
    if (result.success) {
      router.push("/admin/categorias");
    } else {
      alert("Error al guardar: " + result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleAction} className="flex flex-col h-full relative pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crear Categoría</h1>
            <p className="text-white/50 text-sm">Organiza tu catálogo de productos.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Nombre *</label>
                <input required name="name" type="text" placeholder="Ej. Perfumería" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Descripción</label>
                <textarea name="description" rows={4} placeholder="Describe esta categoría..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Imagen de Categoría</h2>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors relative">
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <ImageIcon className="w-8 h-8 text-white/40 mb-3" />
              <p className="text-sm font-medium mb-1">Subir portada de categoría</p>
              <p className="text-xs text-white/40">Soporta PNG, JPG (Max 2MB)</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Organización</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Categoría Padre</label>
                <select name="parentId" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none">
                  <option value="">Ninguna (Categoría Principal)</option>
                  <option value="1">Perfumes de Mujer</option>
                  <option value="2">Perfumes de Hombre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Orden</label>
                <input name="order" type="number" placeholder="0" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 p-4 flex items-center justify-between z-20 px-8">
        <Button type="button" variant="ghost" onClick={() => router.back()} className="text-white/60 hover:text-white">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-gold text-black hover:bg-gold-dark font-bold rounded-full px-8">
          {isSubmitting ? "Guardando..." : "Guardar Categoría"}
          {!isSubmitting && <Save className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </form>
  );
}
