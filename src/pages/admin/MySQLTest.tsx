
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowRight, Info, Server, Database, Terminal } from 'lucide-react';
import { MYSQL_CONFIG } from '@/integrations/mysql/config';
import { mysqlClient, checkMySQLConnection } from '@/integrations/mysql/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MySQLTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [detailedInfo, setDetailedInfo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('connection');
  const [queryResult, setQueryResult] = useState<null | any[]>(null);
  
  // Vérifie automatiquement la connexion au chargement de la page
  useEffect(() => {
    const autoTest = async () => {
      try {
        setConnectionStatus('testing');
        setMessage('Vérification automatique de la connexion à MySQL...');
        
        const result = await checkMySQLConnection();
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur de connexion inconnue');
        }
        
        setConnectionStatus('success');
        setMessage('Connexion à MySQL réussie !');
        setDetailedInfo(result.message || '');
      } catch (error: any) {
        console.error('Erreur lors du test automatique de connexion:', error);
        setConnectionStatus('error');
        setMessage(`Erreur de connexion: ${error.message || error}`);
      }
    };
    
    autoTest();
  }, []);
  
  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setMessage('Vérification de la connexion à MySQL...');
      setDetailedInfo('');
      
      const result = await checkMySQLConnection();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur de connexion inconnue');
      }
      
      setConnectionStatus('success');
      setMessage('Connexion à MySQL réussie !');
      setDetailedInfo(result.message || '');
      toast.success('Connexion à MySQL réussie !');
    } catch (error: any) {
      console.error('Erreur lors du test de connexion:', error);
      setConnectionStatus('error');
      setMessage(`Erreur de connexion: ${error.message || error}`);
      setDetailedInfo(JSON.stringify(error, null, 2));
      toast.error('Échec de la connexion à MySQL');
    }
  };
  
  const testDataRetrieval = async () => {
    try {
      setQueryResult(null);
      setConnectionStatus('testing');
      setMessage('Test de récupération des données...');
      setDetailedInfo('');
      
      const result = await mysqlClient.getJobs();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des données');
      }
      
      const jobCount = result.data ? result.data.length : 0;
      setQueryResult(result.data || []);
      
      setConnectionStatus('success');
      setMessage(`Données récupérées avec succès ! Nombre d'offres: ${jobCount}`);
      toast.success('Récupération des données réussie !');
    } catch (error: any) {
      console.error('Erreur lors de la récupération:', error);
      setConnectionStatus('error');
      setMessage(`Erreur de récupération: ${error.message || error}`);
      setDetailedInfo(JSON.stringify(error, null, 2));
      toast.error('Échec de la récupération des données');
    }
  };
  
  const runCustomQuery = async () => {
    try {
      setQueryResult(null);
      setConnectionStatus('testing');
      setMessage('Exécution de la requête de test...');
      setDetailedInfo('');
      
      const testQuery = "SHOW TABLES";
      const result = await mysqlClient.query(testQuery);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'exécution de la requête');
      }
      
      setQueryResult(result.data || []);
      setConnectionStatus('success');
      setMessage(`Requête exécutée avec succès ! Tables trouvées: ${result.data?.length || 0}`);
      toast.success('Requête exécutée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'exécution de la requête:', error);
      setConnectionStatus('error');
      setMessage(`Erreur d'exécution: ${error.message || error}`);
      setDetailedInfo(JSON.stringify(error, null, 2));
      toast.error('Échec de l\'exécution de la requête');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar />
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-bold mb-6">Test de connexion à MySQL</h1>
          
          <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
            <Info className="h-5 w-5" />
            <AlertTitle>Configuration MySQL</AlertTitle>
            <AlertDescription>
              Votre application est configurée pour se connecter à MySQL sur InfinityFree. 
              Base de données: {MYSQL_CONFIG.database} sur {MYSQL_CONFIG.host}
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center">
                  <Server className="h-5 w-5 mr-2 text-blue-600" />
                  <CardTitle className="text-lg">Statut de la connexion</CardTitle>
                </div>
                <CardDescription>
                  Vérifiez l'état de la connexion à votre base de données MySQL
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {connectionStatus !== 'idle' && (
                  <Alert className={`mb-4 ${
                    connectionStatus === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : connectionStatus === 'error' 
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    {connectionStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
                    {connectionStatus === 'error' && <XCircle className="h-4 w-4 text-red-600 mr-2" />}
                    {connectionStatus === 'testing' && <div className="animate-spin mr-2">⟳</div>}
                    <AlertTitle>
                      {connectionStatus === 'success' ? 'Succès !' : connectionStatus === 'error' ? 'Erreur' : 'Test en cours...'}
                    </AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">
                      {message}
                      {detailedInfo && (
                        <div className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                          {detailedInfo}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={testConnection}
                    disabled={connectionStatus === 'testing'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Tester la connexion
                  </Button>
                  
                  <Button 
                    onClick={testDataRetrieval}
                    disabled={connectionStatus === 'testing'}
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                  >
                    Récupérer les offres <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={runCustomQuery}
                    disabled={connectionStatus === 'testing'}
                    variant="outline"
                    className="border-purple-600 text-purple-700 hover:bg-purple-50"
                  >
                    Lister les tables <Database className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center">
                  <Terminal className="h-5 w-5 mr-2 text-green-600" />
                  <CardTitle className="text-lg">Résultats de requête</CardTitle>
                </div>
                <CardDescription>
                  Résultats de la dernière requête exécutée
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {queryResult === null ? (
                  <div className="text-gray-500 text-center py-8">
                    Exécutez une requête pour voir les résultats ici
                  </div>
                ) : queryResult.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    Aucune donnée trouvée
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(queryResult[0]).map((key) => (
                            <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {queryResult.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.values(row).map((value: any, valueIndex) => (
                              <td key={valueIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="connection" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="connection">Guide de connexion</TabsTrigger>
              <TabsTrigger value="tables">Structure des tables</TabsTrigger>
              <TabsTrigger value="api">Configuration API</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connection">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration de la connexion MySQL</CardTitle>
                  <CardDescription>
                    Étapes pour configurer correctement la connexion à MySQL sur InfinityFree
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">1. Vérifier les paramètres de connexion</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p><strong>Host:</strong> {MYSQL_CONFIG.host}</p>
                      <p><strong>User:</strong> {MYSQL_CONFIG.user}</p>
                      <p><strong>Database:</strong> {MYSQL_CONFIG.database}</p>
                      <p><strong>URL API:</strong> {API_URL}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">2. Configurer CORS sur le serveur PHP</h3>
                    <p className="mb-2">Assurez-vous que votre API PHP a les en-têtes CORS appropriés:</p>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');`}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">3. Vérifiez les permissions MySQL</h3>
                    <p>
                      Assurez-vous que l'utilisateur MySQL a les permissions nécessaires 
                      (SELECT, INSERT, UPDATE, DELETE) sur la base de données.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tables">
              <Card>
                <CardHeader>
                  <CardTitle>Structure des tables MySQL</CardTitle>
                  <CardDescription>
                    Définition des tables nécessaires pour l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">Table jobs</h3>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  description TEXT,
  requirements TEXT,
  contract VARCHAR(50),
  location VARCHAR(255),
  salary JSON,
  positions INT DEFAULT 1,
  deadline DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  publish_date DATE DEFAULT (CURRENT_DATE),
  image VARCHAR(255),
  images JSON,
  applications JSON,
  price DECIMAL(10,2),
  bedrooms INT,
  bathrooms INT,
  is_housing_offer BOOLEAN DEFAULT FALSE
);`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">Table users</h3>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">Table messages</h3>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36),
  receiver_id VARCHAR(36),
  content TEXT NOT NULL,
  \`read\` BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
);`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration de l'API PHP</CardTitle>
                  <CardDescription>
                    Structure de l'API PHP pour communiquer avec la base de données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Endpoints de l'API</h3>
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-semibold">GET /api/test-connection</p>
                        <p className="text-sm text-gray-600">Teste la connexion à la base de données</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-semibold">POST /api/query</p>
                        <p className="text-sm text-gray-600">Exécute une requête SQL</p>
                        <p className="text-xs text-gray-500 mt-1">Corps: { "query": "SELECT * FROM jobs", "params": [] }</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <p className="text-sm text-gray-600">
                    Pour plus d'informations sur la configuration de l'API, consultez la documentation.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MySQLTest;
