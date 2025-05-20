import React, { useState } from 'react';
import { Job } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useJobsService } from '@/services/jobsService';
import { useJobsMutations } from '@/hooks/useJobsMutations';

interface ApplicationFormProps {
  job: Job;
  onSuccess: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ job, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { submitApplication } = useJobsService();
  const { applyForJob } = useJobsMutations(); // Utiliser les mutations pour une meilleure intégration avec React Query

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name || !email || !phone || !coverLetter) {
      toast({
        variant: "destructive",
        title: "Veuillez remplir tous les champs",
        description: "Tous les champs sont obligatoires pour soumettre votre candidature."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Include submittedAt field with current timestamp
      await applyForJob.mutateAsync({
        jobId: job.id, 
        application: {
          applicantName: name,
          email,
          phone,
          coverLetter,
          submittedAt: new Date().toISOString() // Add the missing required field
        }
      });
      
      toast({
        title: "Candidature envoyée !",
        description: "Votre candidature a été soumise avec succès."
      });
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setCoverLetter('');
      
      // Notify parent
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        variant: "destructive",
        title: "Erreur de soumission",
        description: "Impossible de soumettre votre candidature. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Postuler à cette offre</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nom complet</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Votre nom complet"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="votre.email@exemple.com"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input 
            id="phone" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Votre numéro de téléphone"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <Label htmlFor="coverLetter">Lettre de motivation</Label>
          <Textarea 
            id="coverLetter" 
            value={coverLetter} 
            onChange={(e) => setCoverLetter(e.target.value)} 
            placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
            className="min-h-[150px]"
            disabled={isSubmitting}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-sholom-primary hover:bg-sholom-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer ma candidature'
          )}
        </Button>
      </form>
    </div>
  );
};
