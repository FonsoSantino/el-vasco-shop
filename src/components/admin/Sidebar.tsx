"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, 
  Activity, Users, ImageIcon, Settings, 
  Palette, BarChart3, History, LogOut 
} from "lucide-react";
import Image from "next/image";

const navGroups = [
  {
    title: "General",
    items: [
      { name: "Panel", href: "/admin", icon: LayoutDashboard },
      { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    ]
  },
  {
    title: "Catálogo",
    items: [
      { name: "Productos", href: "/admin/productos", icon: Package },
      { name: "Categorías", href: "/admin/categorias", icon: Tags },
      { name: "Inventario", href: "/admin/inventario", icon: Activity },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-black flex flex-col h-screen overflow-y-auto">
      <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
        <Link href="/admin" className="flex items-center space-x-3 hover:scale-[1.02] transition-transform">
          <span className="text-xl font-extrabold tracking-tighter text-white drop-shadow-sm">
            EL VASCO <span className="text-gradient-gold">SHOP</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-8">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              {group.title}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? "bg-gold/10 text-gold font-medium" 
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-gold" : "text-white/40"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 shrink-0">
        <Link
          href="/admin/login"
          onClick={() => { document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; }}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5 opacity-50" />
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </aside>
  );
}
