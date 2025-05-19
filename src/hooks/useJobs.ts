
import { useQuery } from "@tanstack/react-query";
import { useJobsService } from "@/services/jobsService";
import { useJobsMutations } from "@/hooks/useJobsMutations";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";

export const useJobs = () => {
  const { loadJobs, purgeAllJobs } = useJobsService();
  const { addJob, updateJob, deleteJob, applyForJob } = useJobsMutations();

  // Requête pour obtenir tous les jobs depuis Supabase
  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log("Jobs récupérés depuis Supabase:", data?.length || 0);
      
      if (!data || data.length === 0) {
        // Fallback aux données locales si aucun job n'est trouvé
        return loadJobs();
      }
      
      // Transformer les données pour correspondre au format Job
      const formattedData = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        domain: item.domain,
        description: item.description,
        requirements: item.requirements || "",
        contract: item.contract,
        location: item.location,
        salary: item.salary || { amount: 0, currency: "FCFA" },
        positions: item.positions || 1,
        publishDate: item.publish_date || new Date().toISOString().split('T')[0],
        deadline: item.deadline,
        status: item.status || "active",
        images: item.images || [],
        image: item.image || "",
        price: item.price,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        isHousingOffer: item.is_housing_offer || false,
        applications: item.applications || []
      }));
      
      return formattedData;
    } catch (error) {
      console.error("Erreur lors du chargement des jobs:", error);
      // Fallback aux données locales en cas d'erreur
      return loadJobs();
    }
  };

  const { data: jobs = [], isLoading, error, refetch } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 60000,  // 1 minute
    gcTime: 300000,    // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  return {
    jobs,
    isLoading,
    error,
    refetch,
    addJob,
    updateJob,
    deleteJob,
    applyForJob,
    purgeAllJobs
  };
};
