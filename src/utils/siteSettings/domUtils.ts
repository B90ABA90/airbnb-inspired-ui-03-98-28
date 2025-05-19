
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
  
  // Identifier unique pour l'élément de style
  const styleId = 'settings-style-override';
  
  // Vérifier si l'élément style existe déjà
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (styleElement) {
    // Mettre à jour le contenu si l'élément existe déjà
    styleElement.textContent = `
      html, body {
        background-color: var(--background) !important;
        color: var(--foreground) !important;
      }
    `;
  } else {
    // Créer un nouvel élément style si nécessaire
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      html, body {
        background-color: var(--background) !important;
        color: var(--foreground) !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Appliquer le favicon depuis les paramètres
  if (settings.favicon) {
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = settings.favicon;
    faviconLink.type = 'image/png';
    console.log('Favicon applied from settings:', settings.favicon);
  }

  console.log('Settings applied to DOM (light mode):', settings);
};
