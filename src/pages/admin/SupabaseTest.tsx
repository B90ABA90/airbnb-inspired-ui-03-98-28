
import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { SupabaseConnectionTest } from '@/components/admin/supabase/ConnectionTest';

const SupabaseTest = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar />
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-bold mb-6">Test de connexion à Supabase</h1>
          <p className="text-gray-600 mb-8">
            Cette page vous permet de tester la connexion à Supabase et de vérifier que vous pouvez publier des données.
            Si les tests passent avec succès, vous pourrez utiliser toutes les fonctionnalités liées à la base de données.
          </p>
          
          <SupabaseConnectionTest />
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Comment utiliser Supabase dans votre application</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Importer le client Supabase</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
                  {`import { supabase } from '@/integrations/supabase/client';`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">2. Récupérer des données</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
                  {`const { data, error } = await supabase
  .from('jobs')
  .select('*');`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">3. Insérer des données</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
                  {`const { data, error } = await supabase
  .from('jobs')
  .insert({
    title: 'Mon offre',
    domain: 'residential_security',
    description: 'Description...',
    contract: 'full_time',
    location: 'Lomé',
    deadline: '2025-12-31'
  })
  .select();`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;
