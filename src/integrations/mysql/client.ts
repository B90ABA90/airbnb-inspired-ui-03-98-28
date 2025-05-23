
import axios from 'axios';
import { API_URL, MYSQL_CONFIG } from './config';

// Configuration d'Axios pour communiquer avec l'API MySQL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // Timeout après 15 secondes
});

// Interface de réponse de base
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Client MySQL pour remplacer Supabase
export const mysqlClient = {
  // Fonction pour récupérer des données
  async query<T>(query: string, params: any[] = []): Promise<ApiResponse<T>> {
    try {
      console.log('Exécution de la requête MySQL:', { query, params });
      const response = await apiClient.post('/query', { query, params });
      return response.data;
    } catch (error: any) {
      console.error('Erreur MySQL:', error);
      
      // Gestion des différents types d'erreurs
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état hors de la plage 2xx
        console.error('Erreur de réponse:', error.response.data);
        return { 
          success: false, 
          error: error.response.data?.error || `Erreur ${error.response.status}: ${error.response.statusText}`
        };
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Erreur de requête (pas de réponse):', error.request);
        return { 
          success: false, 
          error: 'Le serveur ne répond pas. Vérifiez votre connexion Internet et la disponibilité du serveur.'
        };
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        return { 
          success: false, 
          error: error.message || 'Erreur de connexion à la base de données' 
        };
      }
    }
  },
  
  // Fonction pour vérifier la connexion
  async testConnection(): Promise<ApiResponse<boolean>> {
    try {
      console.log('Test de connexion MySQL...');
      const response = await apiClient.get('/test-connection');
      console.log('Résultat du test de connexion:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur de connexion MySQL:', error);
      
      // Gestion des différents types d'erreurs comme dans la fonction query
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.error || `Erreur ${error.response.status}: ${error.response.statusText}`
        };
      } else if (error.request) {
        return { 
          success: false, 
          error: 'Le serveur ne répond pas. Vérifiez votre connexion Internet et la disponibilité du serveur.'
        };
      } else {
        return { 
          success: false, 
          error: error.message || 'Impossible de se connecter à la base de données' 
        };
      }
    }
  },
  
  // Fonction pour récupérer les emplois
  async getJobs(): Promise<ApiResponse<any[]>> {
    console.log('Récupération des emplois depuis MySQL...');
    return this.query('SELECT * FROM jobs ORDER BY created_at DESC');
  },
  
  // Fonction pour ajouter un emploi
  async addJob(job: any): Promise<ApiResponse<any>> {
    // Génération d'un UUID côté client si nécessaire
    if (!job.id) {
      job.id = crypto.randomUUID();
    }
    
    const query = `
      INSERT INTO jobs 
      (id, title, domain, description, requirements, contract, location, salary, positions, deadline, status, image, images, is_housing_offer) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      job.status || 'active',
      job.image || '',
      JSON.stringify(job.images || []),
      job.isHousingOffer ? 1 : 0
    ];
    
    console.log('Ajout d\'un emploi:', { job });
    return this.query(query, params);
  },
  
  // Fonction pour mettre à jour un emploi
  async updateJob(job: any): Promise<ApiResponse<any>> {
    const query = `
      UPDATE jobs SET 
      title = ?, 
      domain = ?, 
      description = ?, 
      requirements = ?, 
      contract = ?, 
      location = ?, 
      salary = ?, 
      positions = ?, 
      deadline = ?, 
      status = ?,
      image = ?,
      images = ?,
      is_housing_offer = ?
      WHERE id = ?
    `;
    const params = [
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
      job.image || '',
      JSON.stringify(job.images || []),
      job.isHousingOffer ? 1 : 0,
      job.id
    ];
    
    console.log('Mise à jour d\'un emploi:', { job });
    return this.query(query, params);
  },
  
  // Fonction pour supprimer un emploi
  async deleteJob(id: string): Promise<ApiResponse<any>> {
    const query = `DELETE FROM jobs WHERE id = ?`;
    console.log('Suppression d\'un emploi:', { id });
    return this.query(query, [id]);
  }
};

// Fonction pour vérifier la connectivité
export const checkMySQLConnection = async () => {
  try {
    console.log('Vérification de la connexion MySQL...');
    const result = await mysqlClient.testConnection();
    console.log('Résultat de la vérification:', result);
    return { success: result.success, error: result.error || null, message: result.message };
  } catch (err: any) {
    console.error('Erreur non gérée lors de la vérification de la connexion:', err);
    return { success: false, error: err.message };
  }
};
