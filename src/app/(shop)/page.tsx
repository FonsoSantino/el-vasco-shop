import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";
import Link from "next/link";
import { getFeaturedProducts, getProducts } from "@/app/actions/products";
import Image from "next/image";
import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee";
import { formatCurrency } from "@/lib/utils";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const latestProducts = await getProducts({ excludeSpecialOrders: true, limit: 4 });

  return (
    <main className="flex-1 flex flex-col items-center w-full bg-background overflow-hidden">
      {/* 1. PREMIUM HERO */}
      <section className="w-full min-h-[92vh] flex flex-col items-center justify-center relative px-6 border-b border-foreground/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-center z-10 flex flex-col items-center max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-8 px-5 py-2 rounded-full glass border border-foreground/10 text-xs md:text-sm font-bold text-foreground/80 tracking-[0.2em] uppercase premium-shadow">
            El nuevo estándar de calidad
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[100px] font-extrabold tracking-tighter mb-8 leading-[1.05]">
            EL VASCO <span className="text-gradient-gold drop-shadow-xl">SHOP</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/60 max-w-3xl mb-12 font-light leading-relaxed">
            Una selección premium de tecnología, fragancias y accesorios diseñados para exceder expectativas.
          </p>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-14 text-sm font-semibold tracking-wide text-foreground/70 uppercase">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold" /> Productos de Calidad
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" /> Envíos Seguros
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" /> Los Mejores Precios
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link href="/perfumeria" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-10 text-base font-bold rounded-full premium-shadow bg-gold text-black hover:bg-gold-dark hover:scale-105 transition-all duration-300">
                Explorar Colección
              </Button>
            </Link>
            <Link href="/vapes" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-10 text-base font-bold rounded-full backdrop-blur-md hover:bg-foreground/5 hover:scale-105 transition-all duration-300">
                Ver Novedades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 1.5 MARCAS (MARQUEE PREMIUM) */}
      <section className="w-full border-b border-foreground/5 py-12 bg-foreground/[0.01] flex items-center justify-center relative select-none">
        <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <InfiniteMarquee baseVelocity={-0.3}>
          <div className="flex items-center">
            {[
              { name: 'Lattafa', logo: '/brands/lattafa.svg' },
              { name: 'Armaf', logo: '/brands/armaf.svg' },
              { name: 'ElfBar', logo: '/brands/elfbar.svg' },
              { name: 'Al Haramain', logo: '/brands/al-haramain.svg' },
              { name: 'Afnan', logo: '/brands/afnan.svg' },
              { name: 'Ignite', logo: '/brands/ignite.svg' },
            ].map((brand) => (
              <div key={brand.name} className="px-12 md:px-20 flex items-center justify-center shrink-0">
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="brand-logo h-8 md:h-10 w-auto min-w-[120px] object-contain opacity-40 grayscale transition-opacity duration-500 hover:grayscale-0 hover:opacity-100 dark:opacity-80 dark:brightness-0 dark:invert"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </InfiniteMarquee>
      </section>

      {/* 2. PRODUCTOS DESTACADOS (APPLE-STYLE CARDS) */}
      <section className="w-full max-w-7xl mx-auto py-32 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Destacados</h2>
            <p className="text-foreground/50 text-xl font-light">Nuestra selección curada para ti.</p>
          </div>
          <Link href="/perfumeria">
            <Button variant="ghost" className="hidden md:flex text-base font-bold group rounded-full px-6 py-6 border border-foreground/10 hover:bg-foreground/5">
              Ver todos <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="flex items-center justify-center p-12 glass rounded-3xl text-foreground/50">
            Aún no hay productos destacados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link href={`/${product.categorySlug || 'perfumeria'}/${product.slug}`} key={product.id} className="group relative flex flex-col gap-4 rounded-[32px] border border-foreground/5 bg-background premium-shadow transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
                <div className="relative aspect-[4/5] w-full bg-foreground/[0.02] overflow-hidden">
                  {product.imageId ? (
                    <Image src={product.imageId} alt={product.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground/30 font-medium">Sin Imagen</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors duration-500" />
                  
                  <div className="absolute top-5 left-5 z-20">
                    <span className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-background/80 backdrop-blur-md text-foreground rounded-full shadow-sm">
                      Destacado
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/40">{product.brand?.name || product.category?.name || "Categoría"}</span>
                  </div>
                  <h3 className="font-bold text-xl leading-[1.2] tracking-tight text-foreground transition-colors group-hover:text-gold mb-4">{product.name}</h3>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-foreground/5">
                    <span className="text-xl font-extrabold text-foreground">{formatCurrency(product.price)}</span>
                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground group-hover:bg-gold group-hover:text-black transition-colors duration-300">
                      <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. CATEGORÍAS PREMIUM */}
      <section className="w-full border-y border-foreground/5 py-32 bg-foreground/[0.01]">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-foreground/40 mb-3">Explorar</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Colecciones</h2>
            <p className="text-foreground/50 text-xl font-light">Cada universo, curado para ti.</p>
          </div>
          
          {/* Asymmetric featured grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Large card — Perfumería */}
            <Link href="/perfumeria" className="md:col-span-7 group">
              <div className="relative h-[420px] md:h-[560px] rounded-[36px] overflow-hidden cursor-pointer">
                <img
                  src="/images/home/armaf_mandarine.png"
                  alt="Perfumería"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-[0.25em] mb-2">Fragancias</p>
                  <h3 className="text-5xl font-extrabold text-white mb-5 tracking-tight leading-none">Perfumería</h3>
                  <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    Explorar <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Right column — two stacked cards */}
            <div className="md:col-span-5 flex flex-col gap-5">
              {/* Vapes */}
              <Link href="/vapes" className="group">
                <div className="relative h-[260px] md:h-[267px] rounded-[36px] overflow-hidden cursor-pointer">
                  <img
                    src="/images/home/vape_premium.png"
                    alt="Vapes"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-[0.25em] mb-1">Descartables</p>
                    <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Vapes</h3>
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-300">
                      Explorar <ArrowRight className="ml-2 w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Electrónica */}
              <Link href="/electronica" className="group">
                <div className="relative h-[260px] md:h-[267px] rounded-[36px] overflow-hidden cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=900&q=85"
                    alt="Electrónica"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-[0.25em] mb-1">Tech & Audio</p>
                    <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Electrónica</h3>
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-300">
                      Explorar <ArrowRight className="ml-2 w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Bottom full-width — Importados Express */}
          <div className="mt-5">
            <Link href="/importados-express" className="group block">
              <div className="relative h-[260px] rounded-[36px] overflow-hidden cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=85"
                  alt="Importados Express"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-[0.25em] mb-1">Pedidos Especiales</p>
                    <h3 className="text-4xl font-extrabold text-white tracking-tight">Importados Express</h3>
                  </div>
                  <div className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    Ver todo <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>


      {/* 4. ÚLTIMOS INGRESOS */}
      <section className="w-full max-w-7xl mx-auto py-32 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Últimos Ingresos</h2>
            <p className="text-foreground/50 text-xl font-light">Lo más reciente en nuestra tienda.</p>
          </div>
        </div>

        {latestProducts.length === 0 ? (
          <div className="text-foreground/50 p-12 text-center">Aún no hay productos.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {latestProducts.map((product) => (
              <Link href={`/${product.categorySlug || 'perfumeria'}/${product.slug}`} key={product.id}>
                <div className="flex flex-col gap-4 group cursor-pointer">
                  <div className="aspect-[4/5] w-full rounded-[32px] bg-foreground/5 overflow-hidden relative premium-shadow">
                    {product.imageId ? (
                      <Image src={product.imageId} alt={product.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-foreground/30 font-medium">Sin Imagen</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>
                  <div className="px-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-1">{product.brand?.name || product.category?.name}</p>
                    <h4 className="font-bold text-lg leading-tight tracking-tight group-hover:text-gold transition-colors mb-2">{product.name}</h4>
                    <p className="font-bold text-foreground text-lg">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
