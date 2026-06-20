"use client";

import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { createCategory } from "@/app/actions/categories";

export function CreateCategory() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);
    setIsSubmitting(false);
    if (result.success) {
      setIsOpen(false);
    } else {
      alert("Error: " + result.error);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/20 rounded-2xl text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 transition-colors font-medium"
      >
        <Plus className="w-5 h-5" />
        Añadir Nueva Categoría
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-gold/50 rounded-2xl p-6 flex flex-col relative shadow-[0_0_15px_rgba(212,175,55,0.1)]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <h3 className="text-lg font-bold">Nueva Categoría</h3>
        <button type="button" onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <label className="text-xs text-white/50 mb-1 block">Nombre *</label>
        <input required name="name" placeholder="Ej: Ropa" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none" />
      </div>
      <div className="mb-4">
        <label className="text-xs text-white/50 mb-1 block">Descripción</label>
        <textarea name="description" placeholder="Breve descripción..." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none resize-none h-20" />
      </div>
      <div className="mb-4">
        <label className="text-xs text-white/50 mb-1 block">Filtros / Subcategorías (Separados por coma)</label>
        <textarea name="filters" placeholder="Ej: Remeras, Pantalones, Camperas" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none resize-none h-12" />
      </div>
      
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold-dark transition-colors">
          {isSubmitting ? "Creando..." : "Crear Categoría"}
          {!isSubmitting && <Save className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
}
