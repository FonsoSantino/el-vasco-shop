import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-foreground/5 text-foreground py-16 px-6">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="flex flex-col gap-4">
          <span className="text-2xl font-bold tracking-tighter text-gradient-gold">EL VASCO</span>
          <p className="text-foreground/60 mt-2">
            Calidad, atención personalizada y precios altamente competitivos.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="https://instagram.com/elvasco.shop" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-gold hover:text-black transition-colors" title="Instagram">
              <svg className="w-5 h-5 text-foreground/80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-lg mb-2 text-gold">Tienda</h4>
          <Link href="/perfumeria" className="text-foreground/60 hover:text-foreground transition-colors">Perfumes</Link>
          <Link href="/vapes" className="text-foreground/60 hover:text-foreground transition-colors">Vapes</Link>
          <Link href="/electronica" className="text-foreground/60 hover:text-foreground transition-colors">Electrónica</Link>
          <Link href="/importados-express" className="text-foreground/60 hover:text-foreground transition-colors">Importados Express</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-lg mb-2 text-gold">Información</h4>
          <Link href="/envios" className="text-foreground/60 hover:text-foreground transition-colors">Política de Envío</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-lg mb-2 text-gold">Suscríbete</h4>
          <p className="text-foreground/60">Recibe ofertas exclusivas y novedades.</p>
          <div className="flex mt-2">
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="bg-foreground/5 border border-foreground/10 rounded-l-lg px-4 py-2 outline-none focus:border-gold w-full text-foreground placeholder:text-foreground/40"
            />
            <button className="bg-gold text-black font-bold px-4 py-2 rounded-r-lg hover:bg-gold-dark transition-colors">
              Enviar
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl mt-16 pt-8 border-t border-foreground/10 text-center text-foreground/50 text-sm">
        <p>&copy; {new Date().getFullYear()} El Vasco Shop. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
