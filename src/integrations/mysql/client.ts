
import axios from 'axios';
import { API_URL, MYSQL_CONFIG } from './config';

// Configuration d'Axios pour communiquer avec l'API MySQL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interface de réponse de base
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Client MySQL pour remplacer Supabase
export const mysqlClient = {
  // Fonction pour récupérer des données
  async query<T>(query: string, params: any[] = []): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post('/query', { query, params });
      return response.data;
    } catch (error: any) {
      console.error('Erreur MySQL:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion à la base de données' 
      };
    }
  },
  
  // Fonction pour vérifier la connexion
  async testConnection(): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiClient.get('/test-connection');
      return response.data;
    } catch (error: any) {
      console.error('Erreur de connexion MySQL:', error);
      return { 
        success: false, 
        error: error.message || 'Impossible de se connecter à la base de données' 
      };
    }
  },
  
  // Fonction pour récupérer les emplois
  async getJobs(): Promise<ApiResponse<any[]>> {
    return this.query('SELECT * FROM jobs ORDER BY created_at DESC');
  },
  
  // Fonction pour ajouter un emploi
  async addJob(job: any): Promise<ApiResponse<any>> {
    const query = `
      INSERT INTO jobs 
      (title, domain, description, requirements, contract, location, salary, positions, deadline, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      job.status
    ];
    return this.query(query, params);
  }
};

// Fonction pour vérifier la connectivité
export const checkMySQLConnection = async () => {
  try {
    const result = await mysqlClient.testConnection();
    return { success: result.success, error: result.error || null };
  } catch (err: any) {
    console.error('Erreur de connexion à MySQL:', err);
    return { success: false, error: err.message };
  }
};
