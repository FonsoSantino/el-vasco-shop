"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createInventoryMovement } from "@/app/actions/inventory";

export default function NuevoInventarioPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (formData: FormData) => {
    setIsSubmitting(true);
    const result = await createInventoryMovement(formData);
    
    if (result.success) {
      router.push("/admin/inventario");
    } else {
      alert("Error al registrar movimiento: " + result.error);
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
            <h1 className="text-2xl font-bold tracking-tight">Registrar Movimiento</h1>
            <p className="text-white/50 text-sm">Ingreso, salida o ajuste de stock.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
        <div className="space-y-8">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Detalles del Movimiento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Producto *</label>
                <select name="productId" required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none">
                  <option value="">Buscar producto...</option>
                  <option value="1">iPhone 15 Pro Max</option>
                  <option value="2">Tom Ford Ombré Leather</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tipo de Movimiento</label>
                  <select name="type" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none">
                    <option value="IN">Ingreso (Suma)</option>
                    <option value="OUT">Salida (Resta)</option>
                    <option value="ADJ">Ajuste Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Cantidad *</label>
                  <input name="quantity" required type="number" placeholder="0" min="1" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Motivo / Notas</label>
                <textarea name="reason" rows={3} placeholder="Ej. Ingreso por nuevo proveedor..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
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
          {isSubmitting ? "Registrando..." : "Confirmar Movimiento"}
          {!isSubmitting && <Save className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </form>
  );
}
