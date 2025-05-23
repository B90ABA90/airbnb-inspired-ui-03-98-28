
import { mysqlClient } from '@/integrations/mysql/client';
import { Job, JobApplication } from '@/types/job';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer les opérations liées aux offres d'emploi avec MySQL
 */
export const useMySQLJobsService = () => {
  /**
   * Charge les jobs depuis MySQL
   */
  const loadJobs = async (): Promise<Job[]> => {
    try {
      const result = await mysqlClient.getJobs();

      if (!result.success || !result.data) {
        console.error("Erreur lors du chargement des jobs depuis MySQL:", result.error);
        return loadJobsFromLocalStorage();
      }

      console.log("Jobs chargés depuis MySQL:", result.data.length);
      return result.data.map((item: any) => {
        // Parsing du champ salary qui est stocké en JSON
        let salary = { amount: 0, currency: "FCFA" };
        try {
          if (typeof item.salary === 'string') {
            salary = JSON.parse(item.salary);
          } else if (typeof item.salary === 'object') {
            salary = item.salary;
          }
        } catch (e) {
          console.error("Erreur lors du parsing du salaire:", e);
        }

        // Parsing des applications qui sont stockées en JSON
        let applications: JobApplication[] = [];
        try {
          if (item.applications && typeof item.applications === 'string') {
            const parsedApps = JSON.parse(item.applications);
            applications = Array.isArray(parsedApps) ? parsedApps : [];
          } else if (Array.isArray(item.applications)) {
            applications = item.applications;
          }
        } catch (e) {
          console.error("Erreur lors du parsing des applications:", e);
        }

        return {
          id: item.id,
          title: item.title,
          domain: item.domain,
          description: item.description || "",
          requirements: item.requirements || "",
          contract: item.contract || "full_time",
          location: item.location || "",
          salary: salary,
          positions: item.positions || 1,
          publishDate: item.publish_date || new Date().toISOString().split('T')[0],
          deadline: item.deadline || "",
          status: item.status === 'closed' ? 'closed' : 'active',
          images: item.images ? JSON.parse(item.images) : [],
          image: item.image || "",
          applications: applications,
          price: item.price || 0,
          bedrooms: item.bedrooms || 0,
          bathrooms: item.bathrooms || 0,
          isHousingOffer: Boolean(item.is_housing_offer)
        };
      });
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
   * Sauvegarde les jobs dans MySQL et localStorage comme fallback
   */
  const saveJobs = async (jobs: Job[]): Promise<boolean> => {
    try {
      // Sauvegarde dans le stockage local comme fallback
      localStorage.setItem("jobs", JSON.stringify(jobs));
      
      // Pour chaque job, mise à jour ou insertion dans MySQL
      for (const job of jobs) {
        const query = `
          INSERT INTO jobs 
          (id, title, domain, description, requirements, contract, location, salary, positions, deadline, status, images, is_housing_offer) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          domain = VALUES(domain),
          description = VALUES(description),
          requirements = VALUES(requirements),
          contract = VALUES(contract),
          location = VALUES(location),
          salary = VALUES(salary),
          positions = VALUES(positions),
          deadline = VALUES(deadline),
          status = VALUES(status),
          images = VALUES(images),
          is_housing_offer = VALUES(is_housing_offer)
        `;
        
        const params = [
          job.id,
          job.title,
          job.domain,
          job.description,
          job.requirements,
          job.contract,
          job.location,
          JSON.stringify(job.salary),
          job.positions,
          job.deadline,
          job.status,
          JSON.stringify(job.images),
          job.isHousingOffer ? 1 : 0
        ];
        
        const result = await mysqlClient.query(query, params);
        
        if (!result.success) {
          throw new Error(result.error);
        }
      }
      
      console.log("Jobs sauvegardés dans MySQL et localStorage:", jobs.length);
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des jobs:", error);
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
      
      // Supprimer de MySQL
      const result = await mysqlClient.query('DELETE FROM jobs');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
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
    purgeAllJobs
  };
};
