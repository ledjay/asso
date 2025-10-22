'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type TemplateType = 'parents' | 'sports' | 'cultural';

interface Template {
  id: TemplateType;
  title: string;
  description: string;
  icon: string;
  roles: string[];
  groupLabel: string;
  groupExamples: string[];
  color: string;
}

const templates: Template[] = [
  {
    id: 'parents',
    title: "Parents d'élèves",
    description: "Association de parents d'élèves pour la représentation et l'organisation d'événements scolaires",
    icon: '👨‍👩‍👧‍👦',
    roles: ['Délégué titulaire', 'Délégué suppléant', 'Membre'],
    groupLabel: 'Classes',
    groupExamples: ['6e1', '5e2', 'CM2', 'CE1'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'sports',
    title: 'Club sportif',
    description: "Club de sport pour la gestion des équipes, entraînements et compétitions",
    icon: '⚽',
    roles: ['Entraîneur', 'Joueur', 'Parent'],
    groupLabel: 'Équipes / Niveaux',
    groupExamples: ['Poussins', 'Cadets', 'U12', 'Lundi 18h'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'cultural',
    title: 'Association culturelle',
    description: "Association culturelle pour l'organisation d'activités artistiques et culturelles",
    icon: '🎭',
    roles: ['Président', 'Membre actif', 'Membre'],
    groupLabel: 'Sections',
    groupExamples: ['Débutant', 'Intermédiaire', 'Expert'],
    color: 'from-purple-500 to-pink-500',
  },
];

export function TemplateSelectionForm() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async () => {
    if (!selectedTemplate) {
      toast.error('Veuillez sélectionner un type d\'association');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/templates/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: selectedTemplate }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sélection du template');
      }

      toast.success('Configuration réussie! Redirection vers le tableau de bord...');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Template selection error:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === template.id
                ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg'
                : 'hover:scale-105'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className={`text-6xl bg-gradient-to-br ${template.color} bg-clip-text text-transparent`}>
                  {template.icon}
                </div>
                {selectedTemplate === template.id && (
                  <Badge className="bg-blue-500">Sélectionné</Badge>
                )}
              </div>
              <CardTitle className="text-xl">{template.title}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Rôles inclus:</p>
                <div className="flex flex-wrap gap-2">
                  {template.roles.map((role) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{template.groupLabel}:</p>
                <div className="flex flex-wrap gap-2">
                  {template.groupExamples.map((group) => (
                    <Badge key={group} variant="secondary" className="text-xs">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSelect}
          disabled={!selectedTemplate || isLoading}
          className="px-8"
        >
          {isLoading ? 'Configuration en cours...' : 'Confirmer mon choix'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>💡 Vous pourrez personnaliser les rôles et groupes ultérieurement</p>
      </div>
    </div>
  );
}
