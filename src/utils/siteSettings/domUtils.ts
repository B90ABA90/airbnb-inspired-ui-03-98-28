
import { SiteSettings } from '@/types/siteSettings';

export const applySettingsToDOM = (settings: SiteSettings): void => {
  document.documentElement.style.setProperty('--primary', settings.primaryColor);
  document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
  
  // Toujours appliquer les couleurs du mode clair, indépendamment des paramètres
  document.documentElement.style.setProperty('--background', '#F1F0FB'); // Background color (light gray)
  document.documentElement.style.setProperty('--foreground', '#1A1F2C'); // Text color (deep black)
  document.documentElement.style.setProperty('--card', '#FFFFFF');
  document.documentElement.style.setProperty('--card-foreground', '#1A1F2C');
  document.documentElement.style.setProperty('--popover', '#FFFFFF');
  document.documentElement.style.setProperty('--popover-foreground', '#1A1F2C');
  document.documentElement.style.setProperty('--muted', '#F1F5F9');
  document.documentElement.style.setProperty('--muted-foreground', '#64748B');
  document.documentElement.style.setProperty('--border', '#E2E8F0');
  document.documentElement.style.setProperty('--input', '#E2E8F0');
  
  document.documentElement.style.setProperty('--accent', '#D946EF'); // Accent color (magenta)
  
  // S'assurer que le mode sombre est désactivé
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-theme', 'light');
  
  // Forcer le rechargement des styles
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    html, body {
      background-color: var(--background) !important;
      color: var(--foreground) !important;
    }
  `;
  document.head.appendChild(styleElement);

  console.log('Settings applied to DOM (light mode):', settings);
};
