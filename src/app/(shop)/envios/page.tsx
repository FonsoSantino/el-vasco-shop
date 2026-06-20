import { Truck, MapPin, Package, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Política de Envíos | El Vasco Shop",
  description: "Información sobre nuestros métodos de envío a todo el país.",
};

export default function EnviosPage() {
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto py-24 px-6">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Política de <span className="text-gradient-gold">Envíos</span></h1>
        <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
          En EL VASCO SHOP nos aseguramos de que tus productos lleguen de forma rápida y segura a cualquier punto del país.
        </p>
      </div>

      <div className="space-y-12">
        {/* Cobertura */}
        <section className="glass p-8 md:p-12 rounded-3xl premium-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-gold" />
            </div>
            <h2 className="text-2xl font-bold">Cobertura Nacional</h2>
          </div>
          <p className="text-lg text-foreground/80 leading-relaxed">
            <strong>EL VASCO SHOP realiza envíos a todo el país.</strong> No importa en qué provincia te encuentres, trabajamos con las mejores empresas de logística para garantizar la entrega de tu pedido en perfectas condiciones.
          </p>
        </section>

        {/* Modalidades */}
        <section className="glass p-8 md:p-12 rounded-3xl premium-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold">Modalidades de Entrega</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-foreground/[0.02] border border-foreground/5 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gold" /> Entrega Presencial
              </h3>
              <p className="text-foreground/70">
                Disponible únicamente para zonas habilitadas. Coordinamos la entrega directamente con vos una vez confirmado el pedido.
              </p>
            </div>
            <div className="bg-foreground/[0.02] border border-foreground/5 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gold" /> Envíos por Encomienda
              </h3>
              <p className="text-foreground/70">
                Despachamos tu pedido a través de correos y transportes de confianza para el resto del país.
              </p>
            </div>
          </div>
        </section>

        {/* Transportes */}
        <section className="glass p-8 md:p-12 rounded-3xl premium-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold">Transportes Utilizados</h2>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-foreground/80">A nivel nacional trabajamos con:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <li className="flex items-center gap-3 bg-background p-4 rounded-xl border border-foreground/10 font-medium">
                <div className="w-2 h-2 rounded-full bg-gold" /> Andreani
              </li>
              <li className="flex items-center gap-3 bg-background p-4 rounded-xl border border-foreground/10 font-medium">
                <div className="w-2 h-2 rounded-full bg-gold" /> Via Cargo
              </li>
              <li className="flex items-center gap-3 bg-background p-4 rounded-xl border border-foreground/10 font-medium">
                <div className="w-2 h-2 rounded-full bg-gold" /> Correo Argentino
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground/80">Exclusivo Misiones:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <li className="flex items-center gap-3 bg-background p-4 rounded-xl border border-foreground/10 font-medium">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> Neo Mandados
              </li>
            </ul>
          </div>
        </section>

        {/* Condiciones */}
        <section className="glass p-8 md:p-12 rounded-3xl premium-shadow">
          <h2 className="text-2xl font-bold mb-6">Condiciones Generales</h2>
          <ul className="space-y-4 text-foreground/80">
            <li className="flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-gold shrink-0" />
              <span><strong>Elección del método:</strong> El cliente podrá elegir el método de envío disponible que mejor se adapte a sus necesidades durante el proceso de compra.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-gold shrink-0" />
              <span><strong>Costos de envío:</strong> El costo final del envío depende del destino, el peso del paquete y la empresa de transporte seleccionada.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-gold shrink-0" />
              <span><strong>Tiempos de despacho:</strong> El despacho del paquete se realiza únicamente una vez que el pago del pedido ha sido confirmado en nuestro sistema.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-gold shrink-0" />
              <span><strong>Seguimiento:</strong> Una vez despachado, se informará el número de seguimiento correspondiente (cuando el método de envío lo permita) para que puedas rastrear tu paquete en todo momento.</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
