
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { toast } from "sonner";

/**
 * Service pour gérer les opérations liées aux offres d'emploi
 */
export const useJobsService = () => {
  /**
   * Charge les jobs depuis le stockage local (fallback)
   */
  const loadJobs = async (): Promise<Job[]> => {
    try {
      const storedJobs = localStorage.getItem("jobs");
      if (storedJobs) {
        return JSON.parse(storedJobs);
      }
      return [];
    } catch (error) {
      console.error("Erreur lors du chargement des jobs locaux:", error);
      return [];
    }
  };

  /**
   * Sauvegarde les jobs dans le stockage local (fallback)
   */
  const saveJobs = (jobs: Job[]): void => {
    try {
      localStorage.setItem("jobs", JSON.stringify(jobs));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des jobs:", error);
    }
  };

  /**
   * Purge toutes les images des jobs du stockage local
   */
  const purgeAllJobs = () => {
    try {
      localStorage.removeItem("jobs");
      toast.success("Toutes les données des offres ont été supprimées localement");
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression des jobs:", error);
      return false;
    }
  };

  return {
    loadJobs,
    saveJobs,
    purgeAllJobs
  };
};
