"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const { isOpen, setIsOpen, items, removeItem, updateQuantity, getTotal } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-foreground/10 z-[101] flex flex-col premium-shadow-dark"
          >
            <div className="p-6 flex items-center justify-between border-b border-foreground/10">
              <h2 className="text-2xl font-bold flex items-center">
                <ShoppingBag className="w-6 h-6 mr-3 text-gold" />
                Tu Carrito
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-foreground/5">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground/50 gap-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg">Tu carrito está vacío</p>
                  <Button variant="default" onClick={() => setIsOpen(false)} className="mt-4 rounded-full">
                    Explorar Productos
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div layout key={item.id as string} className="flex gap-4 bg-foreground/[0.02] p-4 rounded-2xl border border-foreground/5">
                    <div className="w-20 h-20 bg-foreground/10 rounded-xl overflow-hidden shrink-0">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.image as string} alt={item.name as string} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                          <ShoppingBag className="w-6 h-6 opacity-20" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-between flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold line-clamp-1">{item.name}</h3>
                          {item.category && <p className="text-xs text-foreground/50 uppercase">{item.category}</p>}
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-foreground/40 hover:text-red-500 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-background border border-foreground/10 rounded-full px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center hover:bg-foreground/5 rounded-full"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-foreground/5 rounded-full"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-lg">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-foreground/10 bg-foreground/[0.02]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-foreground/70">Subtotal</span>
                  <span className="text-2xl font-bold">{formatCurrency(getTotal())}</span>
                </div>
                <Button
                  className="w-full h-14 rounded-full text-lg premium-shadow bg-gold hover:bg-gold-dark text-black"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/checkout");
                  }}
                >
                  Continuar al Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
