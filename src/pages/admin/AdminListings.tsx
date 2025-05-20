
import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ListingFormDialog } from '@/components/admin/listings/ListingFormDialog';
import { ListingsTable } from '@/components/admin/listings/ListingsTable';
import { Listing } from '@/types/listing';
import { useListings } from '@/hooks/useListings';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const AdminListings = () => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);

  const {
    listings,
    isLoading,
    error,
    addListing,
    updateListing,
    deleteListing,
    clearAllListingImages
  } = useListings();

  const handleEditListing = (listing: Listing) => {
    setSelectedListing(listing);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: Omit<Listing, "id">) => {
    try {
      if (isEditing && selectedListing) {
        await updateListing.mutateAsync({ ...formData, id: selectedListing.id });
      } else {
        await addListing.mutateAsync(formData);
      }
      setIsEditing(false);
      setSelectedListing(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving listing:', error);
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await deleteListing.mutateAsync(listingId);
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleClearAllImages = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les images de tous les logements? Cette action est irréversible.")) {
      try {
        // Correction: clearAllListingImages retourne un objet avec mutateAsync
        await clearAllListingImages().mutateAsync();
      } catch (error) {
        console.error('Error clearing images:', error);
        toast.error("Erreur lors de la suppression des images");
      }
    }
  };

  const filteredListings = listings?.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = listing.price >= priceFilter.min && listing.price <= priceFilter.max;
    return matchesSearch && matchesPrice;
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="container-wide">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Gestion des logements</h1>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleClearAllImages}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Supprimer toutes les images
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsDialogOpen(true);
                      setIsEditing(false);
                      setSelectedListing(null);
                    }}
                    className="bg-sholom-primary hover:bg-sholom-primary/90 text-white font-medium flex items-center gap-2"
                  >
                    <PlusCircle size={18} />
                    Ajouter un logement
                  </Button>
                </div>
              </div>

              <Card className="mb-6 overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Rechercher par titre ou localisation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="bg-white border-gray-300 min-w-[100px]"
                    >
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filtres
                    </Button>
                  </div>

                  {showFilters && (
                    <div className="flex gap-4 items-center bg-white p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                          <label className="text-sm text-gray-600">Prix minimum</label>
                          <Input
                            type="number"
                            value={priceFilter.min}
                            onChange={(e) => setPriceFilter({ ...priceFilter, min: Number(e.target.value) })}
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Prix maximum</label>
                          <Input
                            type="number"
                            value={priceFilter.max}
                            onChange={(e) => setPriceFilter({ ...priceFilter, max: Number(e.target.value) })}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden shadow-sm">
                {isLoading ? (
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 gap-4 p-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse bg-white p-4 rounded-lg">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                ) : filteredListings && filteredListings.length > 0 ? (
                  <ListingsTable
                    listings={filteredListings}
                    onEdit={handleEditListing}
                    onDelete={handleDelete}
                  />
                ) : (
                  <CardContent>
                    <div className="text-center py-10">
                      <p className="text-gray-500">Aucun logement disponible</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </main>
        </div>
      </div>

      <ListingFormDialog
        selectedListing={selectedListing}
        isEditing={isEditing}
        onSave={handleSave}
        onCancel={() => {
          setSelectedListing(null);
          setIsEditing(false);
          setIsDialogOpen(false);
        }}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
      />
    </SidebarProvider>
  );
};

export default AdminListings;
