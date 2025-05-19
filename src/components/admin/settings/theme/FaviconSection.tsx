
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FaviconSectionProps {
  faviconUrl: string;
  faviconUploading: boolean;
  handleFaviconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FaviconSection: React.FC<FaviconSectionProps> = ({
  faviconUrl,
  faviconUploading,
  handleFaviconUpload
}) => {
  const [faviconError, setFaviconError] = useState(false);
  const [faviconLoaded, setFaviconLoaded] = useState(false);
  const [currentFavicon, setCurrentFavicon] = useState<string>("");
  
  // Reset error when URL changes
  useEffect(() => {
    setFaviconError(false);
    setFaviconLoaded(false);
    
    // Ensure favicon URL is fully qualified
    const defaultFavicon = "/lovable-uploads/94c4ec86-49e9-498e-8fd3-ecdc693ca9fd.png";
    
    if (faviconUrl) {
      // Ensure URL is properly formatted
      const fullUrl = faviconUrl.startsWith('http') || faviconUrl.startsWith('/lovable-uploads/') 
        ? faviconUrl 
        : `/lovable-uploads/${faviconUrl.replace(/^\//, '')}`;
        
      console.log("Favicon URL mise à jour:", fullUrl.substring(0, 30) + "...");
      setCurrentFavicon(fullUrl);
    } else {
      console.log("Utilisation du favicon par défaut");
      setCurrentFavicon(defaultFavicon);
    }
    
    // Apply favicon directly to document
    const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement || document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.href = currentFavicon || defaultFavicon;
    faviconLink.type = 'image/png';
    
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(faviconLink);
    }
    
    console.log('Favicon applied from component:', faviconLink.href);
  }, [faviconUrl, currentFavicon]);
  
  return (
    <div>
      <div className="flex items-center space-x-4 mt-1">
        <div className="h-16 w-16 flex items-center justify-center overflow-hidden bg-gray-50 rounded-lg">
          {!faviconError && currentFavicon ? (
            <img 
              key={`favicon-${Date.now()}`}
              src={currentFavicon} 
              alt="Favicon" 
              className="h-full w-auto object-contain"
              onLoad={() => setFaviconLoaded(true)}
              onError={() => {
                setFaviconError(true);
                console.error("Erreur de chargement du favicon");
                toast.error("Erreur de chargement du favicon");
                // Try to load default favicon
                setCurrentFavicon("/lovable-uploads/94c4ec86-49e9-498e-8fd3-ecdc693ca9fd.png");
              }}
              style={{ display: faviconLoaded ? 'block' : 'none' }}
            />
          ) : (
            <span className="text-sm text-gray-400">Favicon</span>
          )}
          
          {(!faviconLoaded && !faviconError) && (
            <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-lg"></div>
          )}
        </div>
        <div className="relative">
          <Button variant="outline" className="relative" disabled={faviconUploading}>
            {faviconUploading ? "Chargement..." : "Choisir une image"}
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFaviconUpload}
              accept="image/*"
              disabled={faviconUploading}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
