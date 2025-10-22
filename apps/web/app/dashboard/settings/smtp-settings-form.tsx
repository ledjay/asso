'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SmtpSettingsForm() {
  const t = useTranslations('settings');
  const [config, setConfig] = useState({
    host: '',
    port: '587',
    user: '',
    password: '',
    fromEmail: '',
    fromName: '',
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/settings/smtp');
      const data = await response.json();

      if (data.configured) {
        setConfig({
          host: data.host,
          port: data.port.toString(),
          user: data.user,
          password: '', // Don't load password for security
          fromEmail: data.fromEmail,
          fromName: data.fromName,
        });
      }
    } catch (error) {
      console.error('Error loading SMTP config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.host || !config.user || !config.password || !config.fromEmail || !config.fromName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: config.host,
          port: parseInt(config.port),
          user: config.user,
          password: config.password,
          fromEmail: config.fromEmail,
          fromName: config.fromName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success(t('testSuccess'));
      // Clear password field after save
      setConfig({ ...config, password: '' });
    } catch (error) {
      console.error('SMTP save error:', error);
      toast.error(error instanceof Error ? error.message : t('testError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config.host || !config.user || !config.password || !config.fromEmail || !config.fromName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsTesting(true);

    try {
      const response = await fetch('/api/settings/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: config.host,
          port: parseInt(config.port),
          user: config.user,
          password: config.password,
          from: `${config.fromName} <${config.fromEmail}>`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du test');
      }

      toast.success(t('testSuccess'));
    } catch (error) {
      console.error('SMTP test error:', error);
      toast.error(error instanceof Error ? error.message : t('testError'));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('smtpConfiguration')}</CardTitle>
        <CardDescription>
          {t('smtpDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="host">Serveur SMTP</Label>
          <Input
            id="host"
            placeholder="smtp.gmail.com"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
          />
          <p className="text-xs text-gray-500">
            Ex: smtp.gmail.com, smtp-mail.outlook.com
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="number"
            placeholder="587"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
          />
          <p className="text-xs text-gray-500">
            Port 587 (TLS) ou 465 (SSL)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user">Nom d'utilisateur</Label>
          <Input
            id="user"
            type="email"
            placeholder="votre-email@example.com"
            value={config.user}
            onChange={(e) => setConfig({ ...config, user: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
          />
          <p className="text-xs text-gray-500">
            Pour Gmail, utilisez un mot de passe d'application
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromName">{t('smtpFrom')} - Nom</Label>
          <Input
            id="fromName"
            placeholder="Association des Parents"
            value={config.fromName}
            onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromEmail">{t('smtpFrom')} - Email</Label>
          <Input
            id="fromEmail"
            type="email"
            placeholder="association@example.com"
            value={config.fromEmail}
            onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
          />
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Configuration recommandée
          </h4>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• <strong>Gmail</strong>: smtp.gmail.com:587 + mot de passe d'application</li>
            <li>• <strong>Outlook</strong>: smtp-mail.outlook.com:587</li>
            <li>• <strong>Custom</strong>: Vérifiez auprès de votre fournisseur</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || isSaving || isLoading}
          >
            {isTesting ? 'Test en cours...' : t('testConnection')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isTesting || isSaving || isLoading}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
          <strong>💾 Stockage sécurisé</strong>: Vos paramètres SMTP sont chiffrés et stockés en base de données.
          Le mot de passe est protégé par chiffrement AES-256-GCM.
        </div>
      </CardContent>
    </Card>
  );
}
