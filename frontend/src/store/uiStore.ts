import { create } from "zustand";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface UiState {
  toasts: Toast[];
  cartDrawerOpen: boolean;
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
  setCartDrawerOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  cartDrawerOpen: false,
  addToast: (message, type = "info") => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
}));
