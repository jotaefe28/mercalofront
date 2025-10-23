import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Sidebar
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Mobile
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Sidebar
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
      
      // Mobile
      isMobileMenuOpen: false,
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setMobileMenuOpen: (open: boolean) => set({ isMobileMenuOpen: open }),
      
      // Navigation
      currentPage: 'dashboard',
      setCurrentPage: (page: string) => set({ currentPage: page }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isSidebarCollapsed: state.isSidebarCollapsed,
        currentPage: state.currentPage,
      }),
    }
  )
);