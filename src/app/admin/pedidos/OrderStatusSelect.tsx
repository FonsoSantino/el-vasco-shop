"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/orders";

export default function OrderStatusSelect({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus || "PENDIENTE");
  const [isLoading, setIsLoading] = useState(false);

  const statusColors: Record<string, string> = {
    "PENDIENTE": "bg-yellow-500/10 text-yellow-500",
    "PREPARANDO": "bg-blue-500/10 text-blue-500",
    "ENVIADO": "bg-purple-500/10 text-purple-500",
    "ENTREGADO": "bg-green-500/10 text-green-500",
    "CANCELADO": "bg-red-500/10 text-red-500",
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsLoading(true);
    await updateOrderStatus(orderId, newStatus);
    setIsLoading(false);
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isLoading}
      className={`text-xs font-bold px-3 py-1.5 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors ${statusColors[status] || statusColors["PENDIENTE"]}`}
    >
      <option value="PENDIENTE" className="bg-background text-foreground">🟡 Pendiente</option>
      <option value="PREPARANDO" className="bg-background text-foreground">🔵 Preparando</option>
      <option value="ENVIADO" className="bg-background text-foreground">🟣 Enviado</option>
      <option value="ENTREGADO" className="bg-background text-foreground">🟢 Entregado</option>
      <option value="CANCELADO" className="bg-background text-foreground">🔴 Cancelado</option>
    </select>
  );
}
