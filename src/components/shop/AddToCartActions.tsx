"use client";

import { useState, useCallback } from "react";
import { useCartStore } from "@/store/cart";
import { ShoppingCart, Plus, Minus, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface AddToCartActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageId?: string;
    categoryName?: string;
    stock?: number;
    specifications?: string;
    flavors?: string;
  };
}

// Multi flavor assignment using a single grid of flavors with quantity counters
function MultiFlavorSelector({
  quantity,
  availableFlavors,
  flavorCounts,
  onChange,
}: {
  quantity: number;
  availableFlavors: string[];
  flavorCounts: Record<string, number>;
  onChange: (flavor: string, count: number) => void;
}) {
  const totalAllocated = Object.values(flavorCounts).reduce((a, b) => a + b, 0);
  const unassigned = quantity - totalAllocated;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">
          Asigna tus sabores
        </label>
        {unassigned > 0 ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            <AlertCircle className="w-3 h-3" />
            Faltan {unassigned}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
            <Check className="w-3 h-3" />
            Completado
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableFlavors.map((flavor) => {
          const count = flavorCounts[flavor] || 0;
          return (
            <div
              key={flavor}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                count > 0
                  ? "border-gold bg-gold/10 shadow-sm"
                  : "border-foreground/10 bg-foreground/[0.015] hover:border-gold/40 hover:bg-foreground/5"
              }`}
            >
              <span className={`text-sm font-bold ${count > 0 ? "text-gold" : "text-foreground/70"}`}>
                {flavor}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange(flavor, Math.max(0, count - 1))}
                  disabled={count === 0}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-background border border-foreground/10 disabled:opacity-30 hover:bg-foreground/5 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center font-bold text-sm">{count}</span>
                <button
                  type="button"
                  onClick={() => onChange(flavor, count + 1)}
                  disabled={unassigned <= 0}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-background border border-foreground/10 disabled:opacity-30 hover:bg-foreground/5 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Single flavor selector (quantity === 1)
function SingleFlavorSelector({
  availableFlavors,
  selectedFlavor,
  onSelect,
}: {
  availableFlavors: string[];
  selectedFlavor: string | null;
  onSelect: (f: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">
        Sabor
      </label>
      <div className="flex flex-wrap gap-2.5">
        {availableFlavors.map((flavor) => {
          const isSelected = selectedFlavor === flavor;
          return (
            <button
              key={flavor}
              type="button"
              onClick={() => onSelect(flavor)}
              className={`relative px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                isSelected
                  ? "border-gold bg-gold/10 text-gold shadow-sm shadow-gold/20"
                  : "border-foreground/10 bg-background hover:border-gold/50 text-foreground/70 hover:text-foreground"
              }`}
            >
              {isSelected && (
                <Check className="w-3 h-3 absolute top-1 right-1 opacity-60" />
              )}
              {flavor}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AddToCartActions({ product }: AddToCartActionsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const maxStock = product.stock ?? 99;

  // Parse flavors
  const availableFlavors =
    product.flavors
      ? product.flavors.split(",").map((f) => f.trim()).filter((f) => f.length > 0)
      : [];

  const hasFlavors = availableFlavors.length > 0;

  const [quantity, setQuantity] = useState(1);

  // Single-unit flavor state
  const [singleFlavor, setSingleFlavor] = useState<string | null>(null);

  // Multi-unit flavor state: Map flavor -> quantity
  const [flavorCounts, setFlavorCounts] = useState<Record<string, number>>({});

  const handleQuantityChange = useCallback(
    (delta: number) => {
      const next = Math.min(maxStock, Math.max(1, quantity + delta));
      setQuantity(next);

      if (hasFlavors && next > 1) {
        // If we reduce quantity, and total allocated is now greater than next quantity,
        // it's easier to just reset the allocations rather than guess which to remove.
        const totalAllocated = Object.values(flavorCounts).reduce((a, b) => a + b, 0);
        if (totalAllocated > next) {
          setFlavorCounts({});
        }
      }
    },
    [quantity, maxStock, hasFlavors, flavorCounts]
  );

  const handleFlavorCountChange = (flavor: string, count: number) => {
    setFlavorCounts((prev) => ({
      ...prev,
      [flavor]: count,
    }));
  };

  const handleAddToCart = (redirect: boolean = false) => {
    if (hasFlavors) {
      if (quantity === 1) {
        // Single mode
        if (!singleFlavor) {
          toast.error("Por favor selecciona un sabor");
          return;
        }
        addItem({
          id: product.id,
          name: `${product.name} (${singleFlavor})`,
          price: product.price,
          quantity: 1,
          image: product.imageId,
          category: product.categoryName,
          flavor: singleFlavor,
        });
        toast.success("¡Agregado!", {
          description: `1x ${product.name} — ${singleFlavor}`,
        });
      } else {
        // Multi mode
        const totalAllocated = Object.values(flavorCounts).reduce((a, b) => a + b, 0);
        const unassigned = quantity - totalAllocated;
        
        if (unassigned > 0) {
          toast.error(
            `Faltan ${unassigned} ${unassigned === 1 ? "sabor" : "sabores"} por elegir`,
            { description: "Asigna la cantidad total de sabores." }
          );
          return;
        }

        // Add each flavor to cart
        Object.entries(flavorCounts).forEach(([flavor, qty]) => {
          if (qty > 0) {
            addItem({
              id: product.id,
              name: `${product.name} (${flavor})`,
              price: product.price,
              quantity: qty,
              image: product.imageId,
              category: product.categoryName,
              flavor,
            });
          }
        });

        const summary = Object.entries(flavorCounts)
          .filter(([_, q]) => q > 0)
          .map(([f, q]) => `${q}x ${f}`)
          .join(", ");
        toast.success(`${quantity} vapes agregados`, { description: summary });
      }
    } else {
      // No flavors: simple add
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.imageId,
        category: product.categoryName,
      });
      toast.success("Agregado al carrito", {
        description: `${quantity}x ${product.name}`,
      });
    }

    if (redirect) {
      router.push("/checkout");
    }
  };

  const isMultiMode = hasFlavors && quantity > 1;

  return (
    <div className="space-y-6">
      {/* ── Quantity first (so flavor section adapts reactively) ── */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">
          Cantidad
        </label>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center rounded-full bg-foreground/[0.02] border border-foreground/10 p-1">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-foreground/5 disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxStock}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-foreground/5 disabled:opacity-30 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-foreground/40 font-medium">
            {product.stock ? `${product.stock} disponibles` : "Stock disponible"}
          </span>
        </div>
      </div>

      {/* ── Flavor selector (reacts to quantity) ── */}
      <AnimatePresence mode="wait">
        {hasFlavors && (
          <motion.div
            key={isMultiMode ? "multi" : "single"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {isMultiMode ? (
              <MultiFlavorSelector
                quantity={quantity}
                availableFlavors={availableFlavors}
                flavorCounts={flavorCounts}
                onChange={handleFlavorCountChange}
              />
            ) : (
              <SingleFlavorSelector
                availableFlavors={availableFlavors}
                selectedFlavor={singleFlavor}
                onSelect={setSingleFlavor}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA Buttons ── */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          className="w-full h-14 rounded-full border border-gold text-gold font-bold flex items-center justify-center gap-2 hover:bg-gold/5 transition-colors group"
        >
          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Añadir al Carrito
        </button>
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          className="w-full h-14 rounded-full bg-gold text-black font-bold flex items-center justify-center hover:bg-gold-dark premium-shadow transition-colors"
        >
          Comprar Ahora
        </button>
      </div>
    </div>
  );
}
