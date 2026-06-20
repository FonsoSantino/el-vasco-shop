"use client";
import { Activity } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { useRouter } from "next/navigation";

export default function AdminInventoryPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Inventario" 
        description="Controla los movimientos de stock, ingresos y egresos."
        actionLabel="Registrar Movimiento"
        onAction={() => router.push("/admin/inventario/nuevo")}
      />
      <EmptyState 
        icon={Activity}
        title="Sin movimientos"
        description="Registra ingresos o egresos de mercadería para llevar un control exacto."
        actionLabel="Registrar Movimiento"
        onAction={() => router.push("/admin/inventario/nuevo")}
      />
    </div>
  );
}
