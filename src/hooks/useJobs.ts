
import { useQuery } from "@tanstack/react-query";
import { useJobsService } from "@/services/jobsService";
import { useJobsMutations } from "@/hooks/useJobsMutations";
import { Job, JobApplication } from "@/types/job";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export const useJobs = () => {
  const { loadJobs, purgeAllJobs } = useJobsService();
  const { addJob, updateJob, deleteJob, applyForJob } = useJobsMutations();

  // Requête pour obtenir tous les jobs depuis Supabase
  const fetchJobs = async (): Promise<Job[]> => {
    try {
      console.log("Chargement des jobs depuis Supabase...");
      
      // Tentative de récupération depuis Supabase
      const { data: supabaseData, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      if (supabaseData && supabaseData.length > 0) {
        console.log("Jobs récupérés depuis Supabase:", supabaseData.length);
        
        // Mapper les données pour s'assurer qu'elles respectent le format Job
        const mappedJobs: Job[] = supabaseData.map(job => {
          // Conversion du salaire au bon format
          let formattedSalary = { amount: 0, currency: 'FCFA' };
          
          if (job.salary) {
            // Si c'est déjà un objet avec les bonnes propriétés
            if (typeof job.salary === 'object' && 'amount' in job.salary && 'currency' in job.salary) {
              formattedSalary = {
                amount: Number(job.salary.amount) || 0,
                currency: typeof job.salary.currency === 'string' ? job.salary.currency : 'FCFA'
              };
            } 
            // Si c'est un nombre, on l'utilise comme montant
            else if (typeof job.salary === 'number') {
              formattedSalary = {
                amount: job.salary,
                currency: 'FCFA'
              };
            }
            // Si c'est une chaîne, on essaie de la parser
            else if (typeof job.salary === 'string' && !isNaN(Number(job.salary))) {
              formattedSalary = {
                amount: Number(job.salary),
                currency: 'FCFA'
              };
            }
          }
          
          // Validation du statut pour s'assurer qu'il correspond au type attendu
          const validStatus: "active" | "closed" = 
            job.status === 'closed' ? 'closed' : 'active';
          
          // Mapper les applications pour qu'elles correspondent au type JobApplication
          const mappedApplications: JobApplication[] = Array.isArray(job.applications)
            ? job.applications.map((app: any) => {
                // Vérifier si l'application est déjà au bon format
                if (typeof app === 'object' && app !== null) {
                  return {
                    id: app.id || `app-${Math.random().toString(36).substr(2, 9)}`,
                    jobId: app.jobId || job.id,
                    applicantName: app.applicantName || app.name || '',
                    email: app.email || '',
                    phone: app.phone || '',
                    resume: app.resume || undefined,
                    coverLetter: app.coverLetter || '',
                    status: (app.status === 'approved' || app.status === 'rejected' || app.status === 'pending') 
                      ? app.status 
                      : 'pending',
                    submittedAt: app.submittedAt || new Date().toISOString()
                  };
                }
                // Fallback pour les formats non conformes
                return {
                  id: `app-${Math.random().toString(36).substr(2, 9)}`,
                  jobId: job.id,
                  applicantName: '',
                  email: '',
                  phone: '',
                  status: 'pending',
                  submittedAt: new Date().toISOString()
                };
              })
            : [];
          
          return {
            id: job.id,
            title: job.title,
            domain: job.domain,
            description: job.description,
            contract: job.contract,
            location: job.location,
            deadline: job.deadline,
            images: job.images || [],
            image: job.image,
            status: validStatus,
            applications: mappedApplications,
            publishDate: job.publish_date || new Date().toISOString().split('T')[0],
            isHousingOffer: job.is_housing_offer || false,
            requirements: job.requirements || '',
            positions: job.positions || 1,
            salary: formattedSalary,
            price: job.price || 0,
            bedrooms: job.bedrooms || 0,
            bathrooms: job.bathrooms || 0
          };
        });
        
        return mappedJobs;
      } else {
        // Fallback à localStorage si Supabase ne renvoie pas de données
        console.log("Aucune donnée sur Supabase, fallback à localStorage");
        const jobs = await loadJobs();
        return jobs || [];
      }
    } catch (error) {
      console.error("Erreur lors du chargement des jobs:", error);
      // Fallback à localStorage en cas d'erreur
      console.log("Fallback à localStorage suite à une erreur");
      try {
        const jobs = await loadJobs();
        return jobs || [];
      } catch (fallbackError) {
        console.error("Erreur également avec le fallback:", fallbackError);
        return [];
      }
    }
  };

  // Configuration avancée de la requête avec React Query
  const { 
    data: jobs = [], 
    isLoading, 
    error, 
    refetch
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 30000,  // 30 secondes
    gcTime: 300000,    // 5 minutes
    retry: 3,          // Réessayer 3 fois en cas d'échec
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    meta: {
      onError: (err: any) => {
        console.error("Erreur React Query:", err);
        toast.error("Impossible de charger les offres. Veuillez réessayer.");
      }
    }
  });
  
  // Abonnement aux mises à jour temps réel de Supabase
  useEffect(() => {
    const channel = supabase
      .channel('jobs-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs' }, 
        (payload) => {
          console.log('Changement détecté dans la table jobs:', payload);
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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
