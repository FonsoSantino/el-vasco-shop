import { getOrders } from "@/app/actions/orders";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingBag, Truck } from "lucide-react";
import OrderStatusSelect from "./OrderStatusSelect";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = orders.filter((o: any) => new Date(o.createdAt) >= today);
  const todaysRevenue = todaysOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Gestión de Pedidos</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-gold/20 text-gold rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-foreground/60 font-medium">Facturación de Hoy</p>
            <p className="text-2xl font-bold">{formatCurrency(todaysRevenue)}</p>
          </div>
        </div>
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 text-blue-500 rounded-full">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-foreground/60 font-medium">Pedidos de Hoy</p>
            <p className="text-2xl font-bold">{todaysOrders.length}</p>
          </div>
        </div>
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-green-500/20 text-green-500 rounded-full">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-foreground/60 font-medium">Pedidos Totales</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-foreground/5 border-b border-foreground/10">
              <th className="px-6 py-4 font-semibold text-sm text-foreground/70">Pedido</th>
              <th className="px-6 py-4 font-semibold text-sm text-foreground/70">Cliente</th>
              <th className="px-6 py-4 font-semibold text-sm text-foreground/70">Total</th>
              <th className="px-6 py-4 font-semibold text-sm text-foreground/70">Estado</th>
              <th className="px-6 py-4 font-semibold text-sm text-foreground/70">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {orders.map((order: any) => {
              const orderDate = new Date(order.createdAt);
              const isToday = orderDate >= today;
              
              return (
                <tr key={order.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-foreground/50">#{order.id.split('-')[1]}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{order.fullName}</td>
                  <td className="px-6 py-4 text-gold font-bold">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60">
                    {isToday ? 'Hoy ' + orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : orderDate.toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
            
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                  No hay pedidos registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
