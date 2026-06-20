"use client";
import { ShoppingCart } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Pedidos" 
        description="Gestiona los pedidos de tus clientes y actualiza sus estados."
        actionLabel="Crear Pedido Manual"
        onAction={() => {}}
      />
      <EmptyState 
        icon={ShoppingCart}
        title="No hay pedidos aún"
        description="Cuando los clientes realicen compras, aparecerán aquí para que puedas gestionarlas."
      />
    </div>
  );
}
