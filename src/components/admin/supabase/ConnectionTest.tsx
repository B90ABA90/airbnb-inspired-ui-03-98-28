
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  
  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setMessage('Vérification de la connexion à Supabase...');
      
      // Test simple pour vérifier la connexion
      const { data, error } = await supabase
        .from('jobs')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) throw error;
      
      setConnectionStatus('success');
      setMessage(`Connexion réussie ! Nombre d'offres dans la base: ${data.count || 0}`);
      toast.success('Connexion à Supabase réussie !');
    } catch (error: any) {
      console.error('Erreur lors du test de connexion:', error);
      setConnectionStatus('error');
      setMessage(`Erreur de connexion: ${error.message || error}`);
      toast.error('Échec de la connexion à Supabase');
    }
  };
  
  const testDataInsertion = async () => {
    try {
      setConnectionStatus('testing');
      setMessage('Test d\'insertion de données...');
      
      // Créer un job test
      const testJob = {
        title: 'Test Job ' + new Date().toISOString(),
        domain: 'test_domain',
        description: 'Test description',
        contract: 'full_time',
        location: 'Test Location',
        deadline: new Date().toISOString().split('T')[0],
      };
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(testJob)
        .select();
      
      if (error) throw error;
      
      setConnectionStatus('success');
      setMessage(`Données insérées avec succès ! ID: ${data[0].id}`);
      toast.success('Publication de données réussie !');
    } catch (error: any) {
      console.error('Erreur lors de l\'insertion:', error);
      setConnectionStatus('error');
      setMessage(`Erreur d'insertion: ${error.message || error}`);
      toast.error('Échec de la publication de données');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Test de connexion Supabase</CardTitle>
        <CardDescription>
          Vérifiez que votre application peut se connecter à Supabase et publier des données
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
              Vérifiez que votre application peut se connecter à Supabase
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
            <h3 className="font-medium mb-2">2. Tester l'insertion de données</h3>
            <p className="text-sm text-gray-500 mb-2">
              Essayez d'insérer des données test dans la table jobs
            </p>
            <Button 
              onClick={testDataInsertion}
              disabled={connectionStatus === 'testing'}
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              Publier des données test <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Ces tests permettent de vérifier que votre connexion à Supabase fonctionne correctement.
      </CardFooter>
    </Card>
  );
};
