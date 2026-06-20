"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Package, MapPin, CreditCard, CheckCircle2, ChevronRight, Truck, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutWizard() {
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Delivery Method
  const [deliveryType, setDeliveryType] = useState<"LOCAL" | "SHIPPING">("LOCAL");

  // Step 3: Shipping Info (Conditional)
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState(""); // For LOCAL
  const [postalCode, setPostalCode] = useState("");
  const [company, setCompany] = useState(""); // For SHIPPING

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const total = getTotal();

  // Reset company if province changes to non-Misiones and company was Neo Mandados
  useEffect(() => {
    if (province.trim().toLowerCase() !== "misiones" && company === "Neo Mandados") {
      setCompany("");
    }
  }, [province]);

  const canGoNext = () => {
    if (step === 1) return firstName.trim() !== "" && lastName.trim() !== "" && phone.trim() !== "";
    if (step === 2) return true;
    if (step === 3) {
      if (deliveryType === "LOCAL") {
        return address.trim() !== "" && reference.trim() !== "";
      } else {
        return province.trim() !== "" && city.trim() !== "" && address.trim() !== "" && postalCode.trim() !== "" && company !== "";
      }
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) setStep((s) => Math.min(4, s + 1));
  };
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    // Build exact WhatsApp format requested
    const lines = [];
    lines.push('━━━━━━━━━━━━━━');
    lines.push('*EL VASCO SHOP*');
    lines.push('━━━━━━━━━━━━━━');
    lines.push('');
    lines.push('*Cliente:*');
    lines.push(fullName);
    lines.push('');
    lines.push('*Teléfono:*');
    lines.push(phone);
    lines.push('');
    lines.push('');
    lines.push('*Tipo de Entrega:*');
    lines.push(deliveryType === "LOCAL" ? "Entrega Local" : "Envío por Encomienda");
    lines.push('');
    
    if (deliveryType === "LOCAL") {
      lines.push('*Dirección:*');
      lines.push(address);
      lines.push('');
      lines.push('');
      lines.push('*Referencia:*');
      lines.push(reference);
      lines.push('');
      lines.push('');
    } else {
      lines.push('*Provincia:*');
      lines.push(province);
      lines.push('');
      lines.push('*Ciudad:*');
      lines.push(city);
      lines.push('');
      lines.push('*Código Postal:*');
      lines.push(postalCode);
      lines.push('');
      lines.push('*Dirección:*');
      lines.push(address);
      lines.push('');
      lines.push('*Empresa de Envío:*');
      lines.push(company);
      lines.push('');
      lines.push('');
    }

    lines.push('*Productos:*');
    for (const it of items) {
      lines.push(`• ${it.name} x${it.quantity}`);
    }
    lines.push('');
    lines.push('');
    lines.push(`*Subtotal:* ${formatCurrency(total)}`);
    lines.push(`*Envío:* A convenir`);
    lines.push('');
    lines.push(`*TOTAL:* ${formatCurrency(total)}`);
    lines.push('━━━━━━━━━━━━━━');
    lines.push('*MUCHAS GRACIAS POR ELEGIRNOS*');

    const message = lines.join('\n');
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/543751336381?text=${encoded}`;

    clearCart();
    window.location.href = waUrl;
  };

  if (!isClient) return null;

  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mb-6 text-foreground/30">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Tu carrito está vacío</h2>
        <p className="text-foreground/50 mb-8 max-w-md">No tienes ningún producto en el carrito. Explora nuestra tienda para encontrar lo que buscas.</p>
        <Link href="/">
          <button className="px-8 py-4 bg-foreground text-background font-bold rounded-full hover:bg-foreground/80 transition">
            Ir a la tienda
          </button>
        </Link>
      </div>
    );
  }

  const steps = ["Información", "Método", "Envío", "Confirmación"];

  return (
    <main className="min-h-screen bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        
        {/* PREMIUM HEADER & PROGRESS */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">Checkout</h1>
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-foreground/5 -translate-y-1/2 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-[2px] bg-gold -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            <div className="relative flex justify-between w-full">
              {steps.map((label, i) => {
                const s = i + 1;
                const isActive = s === step;
                const isPast = s < step;
                return (
                  <div key={label} className="flex flex-col items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-500 border-2 bg-background ${isActive ? 'border-gold text-gold' : isPast ? 'border-gold bg-gold text-black' : 'border-foreground/10 text-foreground/30'}`}>
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest hidden md:block transition-colors ${isActive || isPast ? 'text-foreground' : 'text-foreground/30'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,_400px] gap-12">
          
          {/* LEFT CONTENT: WIZARD */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {/* STEP 1: PERSONAL INFO */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Información Personal</h2>
                      <p className="text-foreground/50">Ingresa tus datos para contactarte sobre tu pedido.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/70">Nombre</label>
                        <input 
                          type="text" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                          className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                          placeholder="Juan"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/70">Apellido</label>
                        <input 
                          type="text" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                          className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                          placeholder="Pérez"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-foreground/70">Teléfono (WhatsApp)</label>
                        <input 
                          type="tel" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                          placeholder="+54 9 11 1234-5678"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: DELIVERY TYPE */}
                {step === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Método de Entrega</h2>
                      <p className="text-foreground/50">¿Cómo prefieres recibir tu pedido?</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div 
                        onClick={() => setDeliveryType("LOCAL")}
                        className={`cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 relative overflow-hidden group ${
                          deliveryType === "LOCAL" ? "border-gold bg-gold/5" : "border-foreground/10 hover:border-foreground/30 bg-background"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <MapPin className={`w-7 h-7 ${deliveryType === "LOCAL" ? "text-gold" : "text-foreground/50"}`} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Entrega Local</h3>
                        <p className="text-sm text-foreground/50">Entrega directa en la ciudad. Solo requerimos tu dirección y referencia.</p>
                      </div>

                      <div 
                        onClick={() => setDeliveryType("SHIPPING")}
                        className={`cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 relative overflow-hidden group ${
                          deliveryType === "SHIPPING" ? "border-gold bg-gold/5" : "border-foreground/10 hover:border-foreground/30 bg-background"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Truck className={`w-7 h-7 ${deliveryType === "SHIPPING" ? "text-gold" : "text-foreground/50"}`} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Envío por Encomienda</h3>
                        <p className="text-sm text-foreground/50">Envíos a todo el país mediante logística oficial certificada.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: SHIPPING OR LOCAL DETAILS */}
                {step === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{deliveryType === "LOCAL" ? "Dirección de Entrega" : "Datos de Envío"}</h2>
                      <p className="text-foreground/50">Completa los datos para despachar tu pedido.</p>
                    </div>
                    
                    {deliveryType === "LOCAL" ? (
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground/70">Dirección Exacta</label>
                          <input 
                            type="text" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                            placeholder="Ej: Av. San Martín 123"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground/70">Referencia (Importante)</label>
                          <textarea 
                            value={reference} 
                            onChange={(e) => setReference(e.target.value)} 
                            rows={3}
                            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                            placeholder="Ej: Casa blanca frente a la escuela, portón negro."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground/70">Provincia</label>
                          <input 
                            type="text" 
                            value={province} 
                            onChange={(e) => setProvince(e.target.value)} 
                            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                            placeholder="Ej: Misiones"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground/70">Ciudad / Localidad</label>
                          <input 
                            type="text" 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)} 
                            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                            placeholder="Ej: Posadas"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-semibold text-foreground/70">Dirección</label>
                          <input 
                            type="text" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                            placeholder="Calle, Número, Piso, Depto..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground/70">Código Postal</label>
                          <input 
                            type="text" 
                            value={postalCode} 
                            onChange={(e) => setPostalCode(e.target.value)} 
                            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                            placeholder="Ej: 3300"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground/70">Empresa de Envío</label>
                          <select 
                            value={company} 
                            onChange={(e) => setCompany(e.target.value)} 
                            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all appearance-none"
                          >
                            <option value="" disabled>Seleccionar...</option>
                            <option value="Andreani">Andreani</option>
                            <option value="Via Cargo">Vía Cargo</option>
                            <option value="Correo Argentino">Correo Argentino</option>
                            {province.trim().toLowerCase() === 'misiones' && (
                              <option value="Neo Mandados">Neo Mandados</option>
                            )}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: REVIEW */}
                {step === 4 && (
                  <div className="space-y-8">
                    <div className="text-center md:text-left">
                      <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6 text-gold">
                        <MessageCircle className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4">Todo listo</h2>
                      <p className="text-foreground/60 text-lg max-w-md">
                        Al confirmar, generaremos un mensaje estructurado y serás redirigido a WhatsApp para finalizar la coordinación del pago de tu pedido.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-8">
                      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gold" /> Método de pago
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">
                        El pago se acordará directamente por WhatsApp (Transferencia, MercadoPago, Efectivo). Una vez enviado el mensaje, un asesor confirmará el stock y te enviará los datos de pago.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* CONTROLS */}
            <div className="mt-12 flex items-center justify-between border-t border-foreground/10 pt-8">
              <button 
                onClick={handlePrev} 
                className={`flex items-center gap-2 px-6 py-4 rounded-full font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'}`}
              >
                <ArrowLeft className="w-5 h-5" /> Volver
              </button>

              <button 
                onClick={step === 4 ? handleFinish : handleNext} 
                disabled={!canGoNext()}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-gold text-black font-bold premium-shadow hover:scale-105 hover:bg-gold-dark transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {step === 4 ? "Enviar por WhatsApp" : "Continuar"} 
                {step < 4 && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT: CART SUMMARY */}
          <div className="w-full">
            <div className="sticky top-12 rounded-[40px] border border-foreground/10 bg-background p-8 premium-shadow">
              <h3 className="text-xl font-bold mb-6">Tu Pedido</h3>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4 border-b border-foreground/5 pb-4">
                    <div className="w-16 h-16 rounded-xl bg-foreground/5 overflow-hidden flex-shrink-0 relative">
                      {it.image ? (
                        <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 m-auto mt-5 text-foreground/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{it.name}</h4>
                      <p className="text-xs text-foreground/50 mt-1">Cant: {it.quantity}</p>
                    </div>
                    <div className="font-bold text-gold shrink-0">
                      {formatCurrency(it.price * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 space-y-4">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Envío</span>
                  <span className="font-medium text-foreground">A convenir</span>
                </div>
                <div className="flex justify-between border-t border-foreground/10 pt-4">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-extrabold text-foreground">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
