"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCartStore } from "@/store/cart";

export function Header() {
  const router = useRouter();
  const { setIsOpen, getItemCount } = useCartStore();
  const itemCount = getItemCount();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 hover:scale-[1.02] transition-all duration-300">
          <span className="text-xl md:text-2xl font-extrabold tracking-tighter text-foreground drop-shadow-sm">
            EL VASCO <span className="text-gradient-gold">SHOP</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors">
            Inicio
          </Link>
          <Link href="/perfumeria" className="text-foreground/70 hover:text-foreground transition-colors">
            Perfumes
          </Link>
          <Link href="/vapes" className="text-foreground/70 hover:text-foreground transition-colors">
            Vapes
          </Link>
          <Link href="/electronica" className="text-foreground/70 hover:text-foreground transition-colors">
            Electrónica
          </Link>
          <Link href="/importados-express" className="text-foreground/70 hover:text-foreground transition-colors">
            Importados Express
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center absolute left-0 md:static w-full md:w-auto bg-background md:bg-transparent px-6 md:px-0 h-16 md:h-auto z-10">
              <input
                type="text"
                placeholder="Buscar productos, marcas, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-foreground/5 border border-foreground/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gold w-full md:w-64"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="ml-2 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full" title="Buscar" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5" />
              <span className="sr-only">Buscar</span>
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="rounded-full relative" title="Carrito" onClick={() => setIsOpen(true)}>
            <ShoppingBag className="w-5 h-5" />
            <span
              suppressHydrationWarning
              className={`absolute top-0 right-0 w-4 h-4 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center transition-opacity ${itemCount ? "opacity-100" : "opacity-0"}`}
            >
              {itemCount || ""}
            </span>
            <span className="sr-only">Carrito</span>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden rounded-full">
            <Menu className="w-5 h-5" />
            <span className="sr-only">Menú</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
