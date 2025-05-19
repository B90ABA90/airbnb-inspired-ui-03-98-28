
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Listing } from "@/types/listing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { processStoredImages } from "./listingImageUtils";
import { saveListings } from "../useListingStorage";

/**
 * Hook for mutations related to listings (add, update, delete)
 */
export const useListingMutations = () => {
  const queryClient = useQueryClient();

  // Add a new listing
  const addListing = useMutation({
    mutationFn: async (newListing: Omit<Listing, "id">) => {
      try {
        // Générer un ID si nécessaire
        const listingWithId = {
          ...newListing,
          id: uuidv4()
        };

        // Insertion dans Supabase
        const { data, error } = await supabase
          .from("listings")
          .insert([{
            id: listingWithId.id,
            title: listingWithId.title,
            description: listingWithId.description,
            price: listingWithId.price,
            location: listingWithId.location,
            image: listingWithId.image,
            images: listingWithId.images,
            rating: listingWithId.rating || 0,
            dates: listingWithId.dates || "",
            host: listingWithId.host,
            map_location: listingWithId.mapLocation,
            neighborhood: listingWithId.location.split(',')[0]?.trim()
          }])
          .select();

        if (error) throw error;
        
        // Fallback: Aussi sauvegarder localement
        const currentListings = queryClient.getQueryData<Listing[]>(["listings"]) || [];
        const processedListing = processStoredImages(listingWithId);
        const updatedListings = [...currentListings, processedListing];
        saveListings(updatedListings);
        
        return processedListing;
      } catch (error) {
        console.error("Erreur lors de l'ajout du listing:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Logement ajouté avec succès");
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'ajout: ${error.message}`);
    }
  });

  // Update an existing listing
  const updateListing = useMutation({
    mutationFn: async (updatedListing: Listing) => {
      try {
        const { data, error } = await supabase
          .from("listings")
          .update({
            title: updatedListing.title,
            description: updatedListing.description,
            price: updatedListing.price,
            location: updatedListing.location,
            image: updatedListing.image,
            images: updatedListing.images,
            rating: updatedListing.rating || 0,
            dates: updatedListing.dates || "",
            host: updatedListing.host,
            map_location: updatedListing.mapLocation,
            neighborhood: updatedListing.location.split(',')[0]?.trim()
          })
          .eq("id", updatedListing.id)
          .select();

        if (error) throw error;

        // Fallback: Aussi mettre à jour localement
        const currentListings = queryClient.getQueryData<Listing[]>(["listings"]) || [];
        const processedListing = processStoredImages(updatedListing);
        const updatedListings = currentListings.map(listing =>
          listing.id === updatedListing.id ? processedListing : listing
        );
        saveListings(updatedListings);

        return processedListing;
      } catch (error) {
        console.error("Erreur lors de la mise à jour du listing:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Logement mis à jour avec succès");
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  // Delete a listing
  const deleteListing = useMutation({
    mutationFn: async (listingId: string) => {
      try {
        const { error } = await supabase
          .from("listings")
          .delete()
          .eq("id", listingId);

        if (error) throw error;

        // Fallback: Aussi supprimer localement
        const currentListings = queryClient.getQueryData<Listing[]>(["listings"]) || [];
        const updatedListings = currentListings.filter(listing => listing.id !== listingId);
        saveListings(updatedListings);

        return listingId;
      } catch (error) {
        console.error("Erreur lors de la suppression du listing:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Logement supprimé avec succès");
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const clearAllListingImages = () => {
    const currentListings = queryClient.getQueryData<Listing[]>(["listings"]) || [];
    // Cette fonction est gardée pour compatibilité
    return { mutateAsync: () => Promise.resolve() };
  };

  return {
    addListing,
    updateListing,
    deleteListing,
    clearAllListingImages
  };
};
