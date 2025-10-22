'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImportMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportMembersDialog({ open, onOpenChange }: ImportMembersDialogProps) {
  const router = useRouter();
  const t = useTranslations('members');
  const tCommon = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        toast.error(t('csvOnly'));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/members/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Import failed:', data);
        let errorMessage = data.error || t('importError');
        if (data.details && data.details.length > 0) {
          errorMessage += '\n' + data.details.slice(0, 5).join('\n');
        }
        throw new Error(errorMessage);
      }

      toast.success(t('importSuccess', { count: data.imported }));
      
      // Close dialog and refresh page
      onOpenChange(false);
      setFile(null);
      router.refresh();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : t('importError'));
    } finally {
      setIsUploading(false);
    }
  };

  const downloadExample = () => {
    const csvContent = `nom,email,role,groupe
Jean Dupont,jean@example.com,delegue_titulaire,6ème 1
Marie Martin,marie@example.com,membre,5ème 2
Pierre Durand,pierre@example.com,delegue_titulaire;membre,6ème 1;6ème 2`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemple-membres.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('importMembers')}</DialogTitle>
          <DialogDescription>
            {t('importDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload area */}
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  {t('changeFile')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-600">
                  {t('dragDropOrClick')}
                </p>
                <p className="text-xs text-gray-500">ou</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('chooseFile')}
                </Button>
              </div>
            )}
          </div>

          {/* Format instructions */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              {t('fileFormat')}
            </h4>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• {t('requiredColumns')}: <code className="bg-blue-100 px-1 rounded">nom, email, role, groupe</code></li>
              <li>{t('rolesAndGroups')}</li>
              <li>{t('encoding')}: UTF-8</li>
            </ul>
            <Button
              variant="link"
              size="sm"
              className="mt-2 h-auto p-0 text-blue-600"
              onClick={downloadExample}
            >
              {t('downloadExample')}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? t('importing') : t('import')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
