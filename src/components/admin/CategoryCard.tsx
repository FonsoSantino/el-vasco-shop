"use client";

import { useState } from "react";
import { Tags, Image as ImageIcon, Settings, Save, X, Trash2 } from "lucide-react";
import { updateCategory, deleteCategory } from "@/app/actions/categories";

export function CategoryCard({ category }: { category: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateCategory(category.id, formData);
    setIsSubmitting(false);
    if (result.success) {
      setIsEditing(false);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      const res = await deleteCategory(category.id);
      if (!res.success) {
        alert("Error al eliminar: " + res.error);
      }
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-gold/50 rounded-2xl p-6 flex flex-col relative shadow-[0_0_15px_rgba(212,175,55,0.1)]">
        <button type="button" onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="mb-4">
          <label className="text-xs text-white/50 mb-1 block">Nombre</label>
          <input required name="name" defaultValue={category.name} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none" />
        </div>
        <div className="mb-4">
          <label className="text-xs text-white/50 mb-1 block">Descripción</label>
          <textarea name="description" defaultValue={category.description} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none resize-none h-20" />
        </div>
        <div className="mb-4">
          <label className="text-xs text-white/50 mb-1 block">Filtros / Subcategorías (Separados por coma)</label>
          <textarea name="filters" defaultValue={category.filters || ""} placeholder="Ej: Whisky, Tabaco, Ropa" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none resize-none h-12" />
          <p className="text-[10px] text-white/30 mt-1">Estas opciones aparecerán como filtros en la tienda para esta categoría.</p>
        </div>
        <div className="mt-auto flex justify-end">
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold-dark transition-colors">
            {isSubmitting ? "Guardando..." : "Guardar"}
            {!isSubmitting && <Save className="w-4 h-4" />}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-colors flex flex-col group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
            <Tags className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">{category.name}</h3>
            <p className="text-sm text-white/50">/{category.slug}</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-white/60 border border-white/5">
          {category.products?.length || 0} Productos
        </span>
      </div>
      
      <p className="text-sm text-white/70 mb-4 flex-1 leading-relaxed">
        {category.description || "Sin descripción configurada."}
      </p>

      {category.filters && (
        <div className="mb-6 flex flex-wrap gap-2">
          {category.filters.split(',').map((f: string, i: number) => (
            <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-white/10 text-white/70">{f.trim()}</span>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 border-t border-white/10 pt-4 mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white hover:text-gold">
          <Settings className="w-4 h-4" />
          Editar Detalles
        </button>
        <button onClick={handleDelete} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-sm font-medium text-red-400 hover:text-red-300" title="Eliminar Categoría">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
