'use client';

import { create } from 'zustand';

interface UIState {
  sidebarExpanded: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarExpanded: false,
  mobileSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
