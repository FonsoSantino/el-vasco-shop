"use client";

import { motion } from "framer-motion";
import { Filter, PackageOpen, SlidersHorizontal, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  imageId?: string;
  categorySlug?: string;
  isFeatured?: boolean | number;
  isSpecialOrder?: boolean | number;
  stock?: number;
  brand?: { name?: string };
  category?: { name?: string };
  brandName?: string;
  categoryName?: string;
}

interface CategoryViewProps {
  products: Product[];
  filters: string[];
  title: string;
  subtitle: string;
  description: string;
}

type SortKey = "recent" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

export function CategoryView({ products, filters, title, subtitle, description }: CategoryViewProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const getBrandName = (p: Product) => p.brandName || p.brand?.name;
  const getCategoryName = (p: Product) => p.categoryName || p.category?.name;

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const clearFilters = () => setActiveFilters([]);

  const filteredProducts = products
    .filter((product) => {
      if (activeFilters.length > 0) {
        const brand = getBrandName(product);
        return brand ? activeFilters.includes(brand) : false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
      }
    });

  return (
    <main className="flex-1 w-full bg-background min-h-screen">
      {/* Category Hero */}
      <section className="w-full relative h-[38vh] min-h-[280px] flex items-center justify-center overflow-hidden border-b border-foreground/5">
        <div className="absolute inset-0 bg-foreground/[0.01]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <div className="relative z-20 text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-foreground/40 mb-4"
          >
            Colección
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 capitalize"
          >
            {title} <span className="text-gradient-gold">{subtitle}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-base md:text-lg text-foreground/50 max-w-xl mx-auto font-light"
          >
            {description}
          </motion.p>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-60 shrink-0 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-foreground/8">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
              <Filter className="w-4 h-4" /> Filtros
            </h3>
            {activeFilters.length > 0 && (
              <button onClick={clearFilters} className="text-xs text-foreground/40 hover:text-foreground transition-colors font-semibold">
                Limpiar
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Marcas</h4>
            <div className="space-y-1">
              {filters.map((filter) => {
                const isActive = activeFilters.includes(filter);
                return (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-all duration-200 ${
                      isActive ? "bg-gold/10 text-gold font-bold" : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border-2 transition-colors shrink-0 ${
                        isActive ? "bg-gold border-gold" : "border-foreground/20"
                      }`}
                    />
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-foreground/5">
            <p className="text-sm text-foreground/40 font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 text-foreground/40" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-foreground/70 hover:text-foreground"
              >
                <option value="recent">Más recientes</option>
                <option value="price-asc">Precio ↑</option>
                <option value="price-desc">Precio ↓</option>
                <option value="name-asc">Nombre A–Z</option>
                <option value="name-desc">Nombre Z–A</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-foreground/5 rounded-3xl">
              <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-5">
                <PackageOpen className="w-8 h-8 text-foreground/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sin resultados</h3>
              <p className="text-foreground/40 text-sm max-w-sm">
                No encontramos productos con esos filtros. Intenta ajustarlos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {filteredProducts.map((product, i) => {
                const brand = getBrandName(product);
                const categoryName = getCategoryName(product);
                const isFeatured = Boolean(product.isFeatured);
                const isSpecialOrder = Boolean(product.isSpecialOrder);
                const hasDiscount = product.discount && product.discount > product.price;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/${product.categorySlug || "perfumeria"}/${product.slug}`}
                      className="group flex flex-col rounded-[28px] border border-foreground/5 bg-background overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10 hover:border-foreground/10 transition-all duration-500"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/5] w-full bg-foreground/[0.02] overflow-hidden">
                        {product.imageId ? (
                          <Image
                            src={product.imageId}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-foreground/20 text-sm font-medium">
                            Sin imagen
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-500" />

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                          {isSpecialOrder && (
                            <span className="px-3 py-1 rounded-full bg-purple-500/90 text-white text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                              Por Encargo
                            </span>
                          )}
                          {isFeatured && !isSpecialOrder && (
                            <span className="px-3 py-1 rounded-full bg-gold/90 text-black text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                              Destacado
                            </span>
                          )}
                          {hasDiscount && (
                            <span className="px-3 py-1 rounded-full bg-red-500/90 text-white text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                              Oferta
                            </span>
                          )}
                        </div>

                        {/* Quick arrow */}
                        <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1">
                        {/* Brand badge */}
                        {brand && (
                          <div className="mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/35 bg-foreground/5 px-2.5 py-1 rounded-full">
                              {brand}
                            </span>
                          </div>
                        )}

                        <h4 className="font-bold text-base leading-snug tracking-tight text-foreground group-hover:text-gold transition-colors duration-300 mb-3 line-clamp-2 flex-1">
                          {product.name}
                        </h4>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-foreground/5">
                          <div>
                            <span className="text-lg font-extrabold">{formatCurrency(product.price)}</span>
                            {hasDiscount && (
                              <span className="ml-2 text-sm text-foreground/30 line-through">{formatCurrency(product.discount!)}</span>
                            )}
                          </div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/30">
                            {(product.stock ?? 0) > 0 ? "En stock" : "Agotado"}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
