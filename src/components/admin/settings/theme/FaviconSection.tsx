
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
  
  // Reset error when URL changes
  useEffect(() => {
    setFaviconError(false);
    setFaviconLoaded(false);
    console.log("Favicon URL mise à jour:", faviconUrl?.substring(0, 30) + "...");
    
    // Apply favicon directly to document
    if (faviconUrl) {
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = faviconUrl;
      faviconLink.type = 'image/png';
      console.log('Favicon applied from component:', faviconUrl);
    }
  }, [faviconUrl]);
  
  return (
    <div>
      <div className="flex items-center space-x-4 mt-1">
        <div className="h-16 w-16 flex items-center justify-center overflow-hidden bg-gray-50 rounded-lg">
          {!faviconError ? (
            <img 
              key={`favicon-${Date.now()}`}
              src={faviconUrl || "/lovable-uploads/94c4ec86-49e9-498e-8fd3-ecdc693ca9fd.png"} 
              alt="Favicon" 
              className="h-full w-auto object-contain"
              onLoad={() => setFaviconLoaded(true)}
              onError={() => {
                setFaviconError(true);
                console.error("Erreur de chargement du favicon");
                toast.error("Erreur de chargement du favicon");
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
