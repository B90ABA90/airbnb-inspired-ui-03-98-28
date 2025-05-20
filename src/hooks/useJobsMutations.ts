
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Job, JobApplication } from "@/types/job";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Fonction utilitaire pour convertir JobApplication en objet compatible Json
const convertApplicationToJson = (application: JobApplication): Record<string, unknown> => {
  return {
    id: application.id,
    jobId: application.jobId,
    applicantName: application.applicantName,
    email: application.email,
    phone: application.phone,
    resume: application.resume || null,
    coverLetter: application.coverLetter || null,
    status: application.status,
    submittedAt: application.submittedAt
  };
};

export const useJobsMutations = () => {
  const queryClient = useQueryClient();

  // Ajouter une nouvelle offre d'emploi
  const addJob = useMutation({
    mutationFn: async (newJob: Omit<Job, "id">) => {
      try {
        // Générer un ID si nécessaire
        const jobWithId: Job = {
          ...newJob,
          id: uuidv4()
        };

        // Transformer les applications en format Json compatible
        const formattedApplications = jobWithId.applications 
          ? jobWithId.applications.map(app => convertApplicationToJson(app))
          : [];

        // Insertion dans Supabase
        const { data, error } = await supabase
          .from("jobs")
          .insert({
            id: jobWithId.id,
            title: jobWithId.title,
            domain: jobWithId.domain,
            description: jobWithId.description,
            requirements: jobWithId.requirements,
            contract: jobWithId.contract,
            location: jobWithId.location,
            salary: jobWithId.salary,
            positions: jobWithId.positions,
            publish_date: jobWithId.publishDate,
            deadline: jobWithId.deadline,
            status: jobWithId.status || "active",
            images: jobWithId.images,
            image: jobWithId.image,
            price: jobWithId.price,
            bedrooms: jobWithId.bedrooms,
            bathrooms: jobWithId.bathrooms,
            is_housing_offer: jobWithId.isHousingOffer,
            applications: formattedApplications as unknown as Json[]
          })
          .select();

        if (error) throw error;
        
        // Mettre à jour le cache local
        return jobWithId;
      } catch (error) {
        console.error("Erreur lors de l'ajout du job:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Offre d'emploi ajoutée avec succès");
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'ajout: ${error.message}`);
    }
  });

  // Mettre à jour une offre d'emploi existante
  const updateJob = useMutation({
    mutationFn: async (updatedJob: Job) => {
      try {
        // Transformer les applications en format Json compatible
        const formattedApplications = updatedJob.applications 
          ? updatedJob.applications.map(app => convertApplicationToJson(app))
          : [];

        const { data, error } = await supabase
          .from("jobs")
          .update({
            title: updatedJob.title,
            domain: updatedJob.domain,
            description: updatedJob.description,
            requirements: updatedJob.requirements,
            contract: updatedJob.contract,
            location: updatedJob.location,
            salary: updatedJob.salary,
            positions: updatedJob.positions,
            publish_date: updatedJob.publishDate,
            deadline: updatedJob.deadline,
            status: updatedJob.status,
            images: updatedJob.images,
            image: updatedJob.image,
            price: updatedJob.price,
            bedrooms: updatedJob.bedrooms,
            bathrooms: updatedJob.bathrooms,
            is_housing_offer: updatedJob.isHousingOffer,
            applications: formattedApplications as unknown as Json[]
          })
          .eq("id", updatedJob.id)
          .select();

        if (error) throw error;

        return updatedJob;
      } catch (error) {
        console.error("Erreur lors de la mise à jour du job:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Offre d'emploi mise à jour avec succès");
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  // Supprimer une offre d'emploi
  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      try {
        const { error } = await supabase
          .from("jobs")
          .delete()
          .eq("id", jobId);

        if (error) throw error;

        return jobId;
      } catch (error) {
        console.error("Erreur lors de la suppression du job:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Offre d'emploi supprimée avec succès");
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  // Postuler à une offre d'emploi
  const applyForJob = useMutation({
    mutationFn: async ({ jobId, application }: { jobId: string, application: Omit<JobApplication, "id" | "jobId" | "status"> }) => {
      try {
        // Récupérer le job actuel
        const { data: jobData, error: fetchError } = await supabase
          .from("jobs")
          .select("applications")
          .eq("id", jobId)
          .single();

        if (fetchError) throw fetchError;

        // Préparer la nouvelle candidature
        const newApplication: JobApplication = {
          id: uuidv4(),
          jobId: jobId,
          status: "pending",
          submittedAt: new Date().toISOString(),
          ...application
        };

        // Convertir en format compatible avec Json
        const formattedNewApplication = convertApplicationToJson(newApplication);

        // Ajouter la candidature à la liste existante
        const applications = Array.isArray(jobData.applications) ? jobData.applications : [];
        const updatedApplications = [...applications, formattedNewApplication];

        // Mettre à jour le job
        const { error: updateError } = await supabase
          .from("jobs")
          .update({ applications: updatedApplications as unknown as Json[] })
          .eq("id", jobId);

        if (updateError) throw updateError;

        return newApplication;
      } catch (error) {
        console.error("Erreur lors de la candidature:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Candidature envoyée avec succès");
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'envoi de la candidature: ${error.message}`);
    }
  });

  return {
    addJob,
    updateJob,
    deleteJob,
    applyForJob
  };
};
