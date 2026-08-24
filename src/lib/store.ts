import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Item } from './db';

export interface CartItem extends Item {
  cart_item_id: string;
  quantity: number;
  variant_name?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Item, variant_name?: string, price_override?: number) => void;
  removeItem: (cart_item_id: string) => void;
  updateQuantity: (cart_item_id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item, variant_name, price_override) => {
        const currentItems = get().items;
        const cart_item_id = variant_name ? `${item.id}-${variant_name}` : `${item.id}`;
        const existingItem = currentItems.find((i) => i.cart_item_id === cart_item_id);

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.cart_item_id === cart_item_id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          });
        } else {
          const cartItem: CartItem = {
            ...item,
            cart_item_id,
            quantity: 1,
            variant_name,
            price: price_override ?? item.price,
          };
          set({ items: [...currentItems, cartItem], isOpen: true });
        }
      },
      removeItem: (cart_item_id) => {
        set({ items: get().items.filter((i) => i.cart_item_id !== cart_item_id) });
      },
      updateQuantity: (cart_item_id, quantity) => {
        set({
          items: get().items.map((i) => (i.cart_item_id === cart_item_id ? { ...i, quantity } : i)),
        });
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: 'heritage-cart',
    }
  )
);
