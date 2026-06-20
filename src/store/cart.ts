import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  flavor?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, flavor?: string) => void;
  updateQuantity: (id: string, quantity: number, flavor?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id && i.flavor === item.flavor);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.flavor === item.flavor ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, item], isOpen: true };
        });
      },
      removeItem: (id, flavor) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.flavor === flavor)),
        })),
      updateQuantity: (id, quantity, flavor) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id && i.flavor === flavor ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "el-vasco-cart",
    }
  )
);
