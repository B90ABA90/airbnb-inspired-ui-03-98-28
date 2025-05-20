
import { supabase } from "@/integrations/supabase/client";
import { Job, JobApplication } from "@/types/job";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Json } from "@/integrations/supabase/types";

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
   * Soumet une candidature pour un job
   */
  const submitApplication = async (application: {
    jobId: string;
    name: string;
    email: string;
    phone: string;
    coverLetter: string;
  }): Promise<boolean> => {
    try {
      // Récupérer le job actuel
      const { data: jobData, error: fetchError } = await supabase
        .from("jobs")
        .select("applications")
        .eq("id", application.jobId)
        .single();

      if (fetchError) throw fetchError;

      // Préparer la nouvelle candidature
      const newApplication = {
        id: uuidv4(),
        jobId: application.jobId,
        applicantName: application.name,
        email: application.email,
        phone: application.phone,
        coverLetter: application.coverLetter,
        status: "pending",
        submittedAt: new Date().toISOString()
      };

      // Ajouter la candidature à la liste existante
      const applications = Array.isArray(jobData.applications) ? jobData.applications : [];
      const updatedApplications = [...applications, newApplication];

      // Mettre à jour le job
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ applications: updatedApplications })
        .eq("id", application.jobId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
      return false;
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
    purgeAllJobs,
    submitApplication
  };
};
