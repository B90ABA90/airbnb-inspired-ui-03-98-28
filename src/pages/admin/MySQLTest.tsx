
import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowRight, Info } from 'lucide-react';
import { MYSQL_CONFIG } from '@/integrations/mysql/config';
import { mysqlClient, checkMySQLConnection } from '@/integrations/mysql/client';
import { toast } from 'sonner';

const MySQLTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  
  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setMessage('Vérification de la connexion à MySQL...');
      
      const result = await checkMySQLConnection();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur de connexion inconnue');
      }
      
      setConnectionStatus('success');
      setMessage('Connexion à MySQL réussie !');
      toast.success('Connexion à MySQL réussie !');
    } catch (error: any) {
      console.error('Erreur lors du test de connexion:', error);
      setConnectionStatus('error');
      setMessage(`Erreur de connexion: ${error.message || error}`);
      toast.error('Échec de la connexion à MySQL');
    }
  };
  
  const testDataRetrieval = async () => {
    try {
      setConnectionStatus('testing');
      setMessage('Test de récupération des données...');
      
      const result = await mysqlClient.getJobs();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des données');
      }
      
      const jobCount = result.data ? result.data.length : 0;
      
      setConnectionStatus('success');
      setMessage(`Données récupérées avec succès ! Nombre d'offres: ${jobCount}`);
      toast.success('Récupération des données réussie !');
    } catch (error: any) {
      console.error('Erreur lors de la récupération:', error);
      setConnectionStatus('error');
      setMessage(`Erreur de récupération: ${error.message || error}`);
      toast.error('Échec de la récupération des données');
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
          
          <p className="text-gray-600 mb-8">
            Cette page vous permet de tester la connexion à MySQL et de vérifier que vous pouvez récupérer des données.
            Si les tests passent avec succès, vous pourrez utiliser toutes les fonctionnalités liées à la base de données.
          </p>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Test de connexion MySQL</CardTitle>
              <CardDescription>
                Vérifiez que votre application peut se connecter à MySQL et accéder aux données
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  {connectionStatus === 'testing' && <div className="animate-pulse mr-2">⟳</div>}
                  <AlertTitle>
                    {connectionStatus === 'success' ? 'Succès !' : connectionStatus === 'error' ? 'Erreur' : 'Test en cours...'}
                  </AlertTitle>
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">1. Vérifier la connexion</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Vérifiez que votre application peut se connecter à MySQL
                  </p>
                  <Button 
                    onClick={testConnection}
                    disabled={connectionStatus === 'testing'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Tester la connexion
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">2. Tester la récupération de données</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Essayez de récupérer des données depuis la table jobs
                  </p>
                  <Button 
                    onClick={testDataRetrieval}
                    disabled={connectionStatus === 'testing'}
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                  >
                    Récupérer des données <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              Ces tests permettent de vérifier que votre connexion à MySQL fonctionne correctement.
            </CardFooter>
          </Card>
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Étapes supplémentaires requises</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800">1. Configurer un serveur API</h3>
                <p className="mt-1">
                  Vous devez créer un API serveur PHP sur votre hébergement InfinityFree pour faire l'interface 
                  entre cette application React et votre base de données MySQL.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">2. Créer les tables nécessaires</h3>
                <p className="mt-1">
                  Assurez-vous que les tables requises existent dans votre base de données:
                </p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">3. Configurer l'API PHP</h3>
                <p className="mt-1">
                  Créez les endpoints PHP nécessaires pour traiter les requêtes de l'application:
                </p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
                  {`<?php
// api/index.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Connexion à la base de données
$host = 'sql210.infinityfree.com';
$user = 'if0_39052950';
$pass = 'nO631eqsgTGgbET';
$db = 'omar';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erreur de connexion à la base de données']);
  exit;
}

$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Route pour tester la connexion
if (strpos($uri, '/api/test-connection') !== false && $method === 'GET') {
  echo json_encode(['success' => true, 'data' => true]);
  exit;
}

// Route pour exécuter une requête
if (strpos($uri, '/api/query') !== false && $method === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  
  if (!isset($data['query'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Requête manquante']);
    exit;
  }
  
  try {
    $stmt = $conn->prepare($data['query']);
    
    if (isset($data['params']) && !empty($data['params'])) {
      $types = str_repeat('s', count($data['params'])); // Assume all strings for simplicity
      $stmt->bind_param($types, ...$data['params']);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $rows = [];
    while ($row = $result->fetch_assoc()) {
      $rows[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $rows]);
  } catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
  }
  
  exit;
}

// Route non trouvée
http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Route non trouvée']);
?>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySQLTest;
