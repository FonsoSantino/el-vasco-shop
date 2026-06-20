"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Truck, ZoomIn } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { AddToCartActions } from "./AddToCartActions";

interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  imageId?: string;
  categorySlug?: string;
  categoryName?: string;
  brandName?: string;
  isFeatured?: boolean;
  isSpecialOrder?: boolean;
  stock?: number;
  sku?: string;
  specifications?: string;
  flavors?: string;
  images?: string[];
}

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const galleryImages = product.images?.length
    ? product.images
    : product.imageId
    ? [product.imageId]
    : [];

  const [selectedImage, setSelectedImage] = useState<string>(galleryImages[0] || "");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const discountPct =
    product.discount && product.discount > 0
      ? Math.round(((product.discount - product.price) / product.discount) * 100)
      : null;

  return (
    <div className="w-full min-h-screen bg-background pb-32">
      {/* Sticky Breadcrumb */}
      <div className="w-full border-b border-foreground/5 bg-background/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-6 py-4 flex items-center gap-3 text-xs font-semibold text-foreground/40 tracking-widest uppercase">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span className="text-foreground/20">/</span>
          <Link href={`/${product.categorySlug || "perfumeria"}`} className="hover:text-foreground transition-colors">
            {product.categoryName || "Catálogo"}
          </Link>
          <span className="text-foreground/20">/</span>
          <span className="text-foreground truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 pt-10 pb-12">
        <Link
          href={`/${product.categorySlug || "perfumeria"}`}
          className="inline-flex items-center text-sm font-bold text-foreground/40 hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver a {product.categoryName || "la tienda"}
        </Link>

        {/* Main Product Grid: Left Gallery + Right Sticky Info */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 xl:gap-20">
          {/* ── LEFT: Gallery ── */}
          <div className="flex flex-col gap-5">
            {/* Main image with zoom */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/5] w-full rounded-[36px] overflow-hidden bg-foreground/[0.02] border border-foreground/5 group cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {selectedImage ? (
                <>
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-500 ease-out ${isZoomed ? "scale-150" : "scale-100"}`}
                    style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority
                  />
                  {!isZoomed && (
                    <div className="absolute bottom-5 right-5 bg-black/30 backdrop-blur-md text-white rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-foreground/20 font-medium text-sm">
                  Sin imagen
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                {product.isSpecialOrder && (
                  <span className="px-4 py-1.5 rounded-full bg-purple-500/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg backdrop-blur-md">
                    Por Encargo
                  </span>
                )}
                {product.isFeatured && !product.isSpecialOrder && (
                  <span className="px-4 py-1.5 rounded-full bg-gold/90 text-black text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg backdrop-blur-md">
                    Destacado
                  </span>
                )}
                {discountPct && discountPct < 0 && (
                  <span className="px-4 py-1.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg backdrop-blur-md">
                    -{Math.abs(discountPct)}%
                  </span>
                )}
              </div>
            </motion.div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
                {galleryImages.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${
                      selectedImage === img
                        ? "border-gold scale-105 shadow-md shadow-gold/20"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Vista ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description + Specs (below gallery, desktop only) */}
            <div className="hidden lg:block mt-6 space-y-10 border-t border-foreground/8 pt-10">
              {product.description && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">La Experiencia</h3>
                  <p className="text-foreground/70 leading-relaxed text-base font-light">{product.description}</p>
                </div>
              )}
              {(product.specifications || product.sku || product.brandName) && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Especificaciones</h3>
                  <ul className="divide-y divide-foreground/5">
                    {product.brandName && (
                      <li className="flex justify-between py-3">
                        <span className="text-sm text-foreground/50">Marca</span>
                        <span className="text-sm font-semibold">{product.brandName}</span>
                      </li>
                    )}
                    <li className="flex justify-between py-3">
                      <span className="text-sm text-foreground/50">Categoría</span>
                      <span className="text-sm font-semibold capitalize">{product.categoryName}</span>
                    </li>
                    {product.sku && (
                      <li className="flex justify-between py-3">
                        <span className="text-sm text-foreground/50">SKU</span>
                        <span className="text-sm font-semibold font-mono">{product.sku}</span>
                      </li>
                    )}
                    {product.specifications && (
                      <li className="py-3">
                        <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">{product.specifications}</p>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Sticky Purchase Card ── */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:sticky lg:top-28 space-y-8"
            >
              {/* Brand & Name */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-foreground/40 mb-3">
                  {product.brandName || product.categoryName}
                </p>
                <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.05] mb-6">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold">{formatCurrency(product.price)}</span>
                  {product.discount && product.discount > 0 && (
                    <span className="text-lg text-foreground/30 line-through font-medium">
                      {formatCurrency(product.discount)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    (product.stock ?? 0) > 5
                      ? "bg-green-500"
                      : (product.stock ?? 0) > 0
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-semibold text-foreground/60">
                  {(product.stock ?? 0) > 5
                    ? "En stock"
                    : (product.stock ?? 0) > 0
                    ? `Solo ${product.stock} disponibles`
                    : "Sin stock"}
                </span>
              </div>

              {/* Add to Cart / Flavor Selector */}
              <AddToCartActions
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageId: product.imageId,
                  categoryName: product.categoryName,
                  stock: product.stock,
                  specifications: product.specifications,
                  flavors: product.flavors,
                }}
              />

              {/* Trust Signals */}
              {product.isSpecialOrder ? (
                <div className="rounded-2xl bg-purple-500/5 border border-purple-500/20 p-5">
                  <p className="font-bold text-purple-400 mb-1">🔥 Artículo Exclusivo Por Encargo</p>
                  <p className="text-sm text-foreground/60">
                    Garantizamos la importación de este artículo. El tiempo estimado de llegada será informado al finalizar el pedido.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 border-t border-foreground/5 pt-6">
                  <div className="flex items-center gap-3 text-sm text-foreground/60">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-blue-500" />
                    </div>
                    <span>Envíos a todo el país mediante logística certificada.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground/60">
                    <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                    </div>
                    <span>Garantía de originalidad 100%. Embalaje de alta seguridad.</span>
                  </div>
                </div>
              )}

              {/* Description on mobile */}
              <div className="lg:hidden space-y-6 border-t border-foreground/5 pt-6">
                {product.description && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 mb-3">La Experiencia</h3>
                    <p className="text-foreground/70 leading-relaxed text-sm">{product.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-28 pt-16 border-t border-foreground/8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">También te puede interesar</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Relacionados</h2>
              </div>
              <Link
                href={`/${product.categorySlug || "perfumeria"}`}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors"
              >
                Ver todos <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {relatedProducts.map((prod, i) => (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/${prod.categorySlug || "perfumeria"}/${prod.slug}`} className="group block">
                    <div className="relative aspect-[4/5] w-full rounded-[28px] bg-foreground/[0.02] border border-foreground/5 overflow-hidden mb-4">
                      {prod.imageId ? (
                        <Image
                          src={prod.imageId}
                          alt={prod.name}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-foreground/20 text-sm">Sin imagen</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                      {prod.isFeatured && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold/90 text-black text-[9px] font-bold uppercase tracking-[0.2em]">
                          Destacado
                        </span>
                      )}
                    </div>
                    <div className="px-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-1">
                        {prod.brandName || prod.categoryName}
                      </p>
                      <h3 className="font-semibold text-base leading-snug text-foreground transition-colors group-hover:text-gold mb-2 line-clamp-2">
                        {prod.name}
                      </h3>
                      <p className="font-bold text-gold">{formatCurrency(prod.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
