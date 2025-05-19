
import { useQuery } from "@tanstack/react-query";
import { Listing } from "@/types/listing";
import { supabase } from "@/integrations/supabase/client";

/**
 * Custom hook to fetch listings data from Supabase
 */
export const useFetchListings = () => {
  return useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        console.log("Listings récupérés depuis Supabase:", data?.length || 0);
        
        if (!data || data.length === 0) {
          // Fallback aux données locales si aucune donnée n'est trouvée
          const localListings = localStorage.getItem("listings");
          if (localListings) {
            return JSON.parse(localListings);
          }
          return [];
        }
        
        // Transformer les données pour correspondre au format Listing
        const formattedData = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          price: Number(item.price),
          location: item.location,
          image: item.image || "",
          images: item.images || [],
          rating: Number(item.rating) || 0,
          dates: item.dates || "",
          host: item.host || {
            name: "Shalom JobCenter",
            image: "/lovable-uploads/94c4ec86-49e9-498e-8fd3-ecdc693ca9fd.png"
          },
          mapLocation: item.map_location || ""
        }));
        
        return formattedData;
      } catch (error) {
        console.error("Erreur lors du chargement des listings:", error);
        
        // Fallback aux données locales en cas d'erreur
        const localListings = localStorage.getItem("listings");
        if (localListings) {
          return JSON.parse(localListings);
        }
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};
