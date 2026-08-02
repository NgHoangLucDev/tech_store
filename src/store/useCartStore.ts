import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  originalPrice?: number;
  original_price?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any) => void;
  addItems: (products: any[]) => void;
  removeItem: (id: string) => void;
  totalItems: () => number;
  totalPrice: () => number;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      set({
        items: items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },
  addItems: (products) => {
    const items = get().items;
    const newItems = [...items];
    products.forEach(product => {
      const existing = newItems.find(i => i.id.toString() === product.id.toString());
      const quantityToAdd = product.quantity || 1;
      if (existing) {
        existing.quantity += quantityToAdd;
      } else {
        newItems.push({ ...product, quantity: quantityToAdd });
      }
    });
    set({ items: newItems });
  },
  removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
    } else {
      set({
        items: get().items.map(i => i.id === id ? { ...i, quantity } : i)
      });
    }
  },
  totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  clearCart: () => set({ items: [] }),
}));


