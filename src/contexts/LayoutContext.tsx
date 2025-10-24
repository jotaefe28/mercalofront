import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LayoutContextType {
  rightPanelContent: ReactNode | null;
  setRightPanelContent: (content: ReactNode | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [rightPanelContent, setRightPanelContent] = useState<ReactNode | null>(null);

  return (
    <LayoutContext.Provider value={{ rightPanelContent, setRightPanelContent }}>
      {children}
    </LayoutContext.Provider>
  );
};