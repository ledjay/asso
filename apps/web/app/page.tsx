import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  // If logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                AssociationHub
              </h1>
            </div>
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Gérez votre association simplement
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            AssociationHub est une plateforme open-source pour gérer les membres
            de votre association et envoyer des emails personnalisés en quelques
            clics.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Commencer
            </Link>
            <a
              href="https://github.com/associationhub/associationhub"
              className="text-base font-semibold leading-7 text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              En savoir plus <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-3xl">👥</div>
              <h3 className="mt-4 font-semibold text-gray-900">
                Gestion des membres
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Importez et gérez vos membres facilement via CSV
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-3xl">📧</div>
              <h3 className="mt-4 font-semibold text-gray-900">
                Emails personnalisés
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Envoyez des emails avec des balises personnalisées
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-3xl">🎨</div>
              <h3 className="mt-4 font-semibold text-gray-900">
                Templates flexibles
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Parents, sports, culturel - adaptez à votre besoin
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>
            Open-source sous licence MIT •{' '}
            <a
              href="https://github.com/associationhub/associationhub"
              className="text-blue-600 hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
