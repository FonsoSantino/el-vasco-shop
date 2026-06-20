"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const metrics = [
    { title: "Ventas de Hoy", value: "$145,231", change: "+20.1%", icon: DollarSign, isGood: true },
    { title: "Pedidos Pendientes", value: "12", change: "4 por preparar", icon: ShoppingBag, isGood: true },
    { title: "Clientes Totales", value: "1,245", change: "+5 nuevos hoy", icon: Users, isGood: true },
    { title: "Stock Bajo", value: "8 productos", change: "Requiere atención", icon: AlertCircle, isGood: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient-gold">Panel de Control</h1>
        <p className="text-white/50 mt-2">Bienvenido de nuevo. Este es el resumen de EL VASCO SHOP hoy.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              key={metric.title}
              className="glass-dark p-6 rounded-2xl flex flex-col hover:bg-white/[0.08] transition-colors cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white/60">{metric.title}</span>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${metric.isGood ? 'text-gold' : 'text-red-400'}`} />
                </div>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <h3 className="text-2xl font-bold">{metric.value}</h3>
                <span className={`text-xs font-medium ${metric.isGood ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Tables placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-dark rounded-2xl p-6 min-h-[400px] flex items-center justify-center border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent z-0" />
          <p className="text-white/30 font-medium z-10">Gráfico de Ingresos (Próximamente)</p>
        </div>
        <div className="glass-dark rounded-2xl p-6 min-h-[400px] flex flex-col border border-white/10 relative">
          <h3 className="text-lg font-bold mb-6">Actividad Reciente</h3>
          
          <div className="flex-1 flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 w-full opacity-50">
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse shrink-0" />
                <div className="flex flex-col gap-2 w-full pt-1">
                  <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-2 w-1/3 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
