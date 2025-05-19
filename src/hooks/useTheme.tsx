
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light'; // Seulement 'light' comme option maintenant

interface ThemeProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeContextType = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeContext = createContext<ThemeContextType>(initialState);

export function ThemeProvider({
  children,
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme] = useState<Theme>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Supprimer toute classe dark qui pourrait être présente
    root.classList.remove('dark');
    
    // Toujours définir le thème clair
    root.setAttribute('data-theme', 'light');
    root.classList.add('light');
    
    // Stocker le thème en local storage
    localStorage.setItem(storageKey, 'light');
    
    // Gérer les styles globaux pour forcer le mode clair
    const styleId = 'theme-override-style';
    
    // Vérifier si l'élément style existe déjà
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (styleElement) {
      // Mettre à jour le contenu si l'élément existe déjà
      styleElement.textContent = `
        .dark {
          display: none !important;
        }
        
        [data-theme="dark"] {
          --background: 0 0% 100% !important;
          --foreground: 222.2 84% 4.9% !important;
        }
      `;
    } else {
      // Créer un nouvel élément style
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        .dark {
          display: none !important;
        }
        
        [data-theme="dark"] {
          --background: 0 0% 100% !important;
          --foreground: 222.2 84% 4.9% !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, [storageKey]);

  const value: ThemeContextType = {
    theme: 'light' as Theme,
    setTheme: () => {
      // Ne change rien, toujours en mode clair
      localStorage.setItem(storageKey, 'light');
    },
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
    
  return context;
};
