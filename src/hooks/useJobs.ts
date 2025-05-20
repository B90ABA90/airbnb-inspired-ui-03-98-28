
import { useQuery } from "@tanstack/react-query";
import { useJobsService } from "@/services/jobsService";
import { useJobsMutations } from "@/hooks/useJobsMutations";
import { Job } from "@/types/job";

export const useJobs = () => {
  const { loadJobs, purgeAllJobs } = useJobsService();
  const { addJob, updateJob, deleteJob, applyForJob } = useJobsMutations();

  // Requête pour obtenir tous les jobs depuis Supabase
  const fetchJobs = async (): Promise<Job[]> => {
    try {
      // Utiliser directement la fonction loadJobs du service
      // qui gère maintenant correctement la récupération depuis Supabase 
      // avec fallback vers localStorage
      const jobs = await loadJobs();
      console.log("Jobs récupérés:", jobs?.length || 0);
      return jobs;
    } catch (error) {
      console.error("Erreur lors du chargement des jobs:", error);
      return [];
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
