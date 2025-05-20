
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
   * Charge les jobs depuis Supabase
   */
  const loadJobs = async (): Promise<Job[]> => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des jobs depuis Supabase:", error);
        return loadJobsFromLocalStorage();
      }

      if (!data || data.length === 0) {
        console.log("Aucun job trouvé dans Supabase, utilisation du stockage local");
        return loadJobsFromLocalStorage();
      }

      console.log("Jobs chargés depuis Supabase:", data.length);
      return data.map((item: any) => ({
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
    } catch (error) {
      console.error("Erreur lors du chargement des jobs:", error);
      return loadJobsFromLocalStorage();
    }
  };

  /**
   * Charge les jobs depuis le stockage local (fallback)
   */
  const loadJobsFromLocalStorage = (): Promise<Job[]> => {
    try {
      const storedJobs = localStorage.getItem("jobs");
      if (storedJobs) {
        return Promise.resolve(JSON.parse(storedJobs));
      }
      return Promise.resolve([]);
    } catch (error) {
      console.error("Erreur lors du chargement des jobs locaux:", error);
      return Promise.resolve([]);
    }
  };

  /**
   * Sauvegarde les jobs dans Supabase et localStorage comme fallback
   */
  const saveJobs = async (jobs: Job[]): Promise<boolean> => {
    try {
      // Sauvegarde dans le stockage local comme fallback
      localStorage.setItem("jobs", JSON.stringify(jobs));
      
      // Pour chaque job, mise à jour ou insertion dans Supabase
      for (const job of jobs) {
        // Transformation des applications en format Json compatible
        const formattedApplications = job.applications 
          ? job.applications.map(app => ({
              id: app.id,
              jobId: app.jobId,
              applicantName: app.applicantName,
              email: app.email,
              phone: app.phone,
              resume: app.resume || null,
              coverLetter: app.coverLetter || null,
              status: app.status,
              submittedAt: app.submittedAt
            }))
          : [];

        // Vérifier si le job existe déjà
        const { data: existingJob } = await supabase
          .from("jobs")
          .select("id")
          .eq("id", job.id)
          .single();

        if (existingJob) {
          // Mise à jour
          const { error: updateError } = await supabase
            .from("jobs")
            .update({
              title: job.title,
              domain: job.domain,
              description: job.description,
              requirements: job.requirements,
              contract: job.contract,
              location: job.location,
              salary: job.salary,
              positions: job.positions,
              publish_date: job.publishDate,
              deadline: job.deadline,
              status: job.status,
              images: job.images,
              image: job.image,
              price: job.price,
              bedrooms: job.bedrooms,
              bathrooms: job.bathrooms,
              is_housing_offer: job.isHousingOffer,
              applications: formattedApplications as unknown as Json[]
            })
            .eq("id", job.id);

          if (updateError) throw updateError;
        } else {
          // Insertion
          const { error: insertError } = await supabase
            .from("jobs")
            .insert({
              id: job.id,
              title: job.title,
              domain: job.domain,
              description: job.description,
              requirements: job.requirements,
              contract: job.contract,
              location: job.location,
              salary: job.salary,
              positions: job.positions,
              publish_date: job.publishDate,
              deadline: job.deadline,
              status: job.status,
              images: job.images,
              image: job.image,
              price: job.price,
              bedrooms: job.bedrooms,
              bathrooms: job.bathrooms,
              is_housing_offer: job.isHousingOffer,
              applications: formattedApplications as unknown as Json[]
            });

          if (insertError) throw insertError;
        }
      }
      
      console.log("Jobs sauvegardés dans Supabase et localStorage:", jobs.length);
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des jobs:", error);
      return false;
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

      toast.success("Candidature soumise avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
      toast.error("Erreur lors de la soumission de la candidature");
      return false;
    }
  };

  /**
   * Purge toutes les données des jobs
   */
  const purgeAllJobs = async (): Promise<boolean> => {
    try {
      // Supprimer du stockage local
      localStorage.removeItem("jobs");
      
      // Supprimer de Supabase (attention, cela supprime tous les jobs)
      const { error } = await supabase
        .from("jobs")
        .delete()
        .neq("id", "placeholder"); // Cette condition est toujours vraie, donc supprime tout
      
      if (error) throw error;
      
      toast.success("Toutes les données des offres ont été supprimées");
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression des jobs:", error);
      toast.error("Erreur lors de la suppression des jobs");
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
