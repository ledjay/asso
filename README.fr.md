# AssociationHub

> 📖 [English version](./README.md)

**Plateforme open-source de gestion de membres et de communication par email pour les associations**

[![CI](https://github.com/associationhub/associationhub/workflows/CI/badge.svg)](https://github.com/associationhub/associationhub/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

## ✨ Fonctionnalités

- 👥 **Gestion des membres** - Importez, exportez et gérez les membres de votre association
- 📧 **Communication par email** - Envoyez des emails personnalisés avec des balises de template
- 🎯 **Filtrage intelligent** - Ciblez des rôles et groupes spécifiques
- 📎 **Pièces jointes** - Envoyez des fichiers PDF avec vos emails
- 🎨 **Templates** - Pré-configuré pour les associations de Parents, Sportives et Culturelles
- 🌍 **i18n Ready** - Français par défaut, Anglais et plus de langues à venir
- 🐳 **Docker Ready** - Configuration en une commande avec Docker Compose
- 🚀 **Auto-hébergeable** - Déployez sur Vercel, Railway, Docker, ou n'importe quel hébergeur Node.js

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- pnpm 8+
- Docker (pour la base de données locale)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/associationhub/associationhub.git
cd associationhub

# Installer les dépendances
pnpm install

# Copier les variables d'environnement
cp .env.example .env

# Générer les secrets (ajouter dans .env)
openssl rand -base64 32  # NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # ENCRYPTION_KEY

# Démarrer PostgreSQL
docker compose up -d

# Exécuter les migrations
cd packages/database && npx prisma migrate dev && cd ../..

# Démarrer le serveur de développement
pnpm dev
```

Visitez **http://localhost:3000** 🎉

**Connexion par défaut**: `admin@example.com` / `password123`

📖 Voir [SETUP.md](./SETUP.md) pour les instructions complètes incluant la configuration SMTP.

## 📚 Documentation

- [Guide d'Installation](./SETUP.md) - Instructions complètes avec configuration SMTP
- [Guide de Contribution](./CONTRIBUTING.fr.md) - Comment contribuer
- [Code de Conduite](./CODE_OF_CONDUCT.fr.md) - Règles de la communauté
- [Documentation Complète](./docs/fr/) - Guides complets

## 🏗️ Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Base de données**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js v5
- **UI**: shadcn/ui + Tailwind CSS
- **Email**: Nodemailer
- **Monorepo**: pnpm workspaces
- **Déploiement**: Vercel, Railway, Docker

## 📦 Structure du Projet

```
association-hub/
├── apps/
│   └── web/              # Application Next.js
├── packages/
│   ├── ui/              # Bibliothèque de composants (shadcn/ui)
│   ├── database/        # Prisma + logique base de données
│   ├── email/           # Envoi d'emails (Nodemailer)
│   ├── auth/            # Authentification (NextAuth)
│   └── types/           # Types TypeScript partagés
├── docker-compose.yml   # Configuration PostgreSQL
└── .env.example         # Template des variables d'environnement
```

## 🤝 Contribuer

Nous accueillons les contributions ! Consultez notre [Guide de Contribution](./CONTRIBUTING.fr.md) pour plus de détails.

```bash
# Forkez le dépôt
# Clonez votre fork
git clone https://github.com/VOTRE_NOM/associationhub.git

# Créez une branche
git checkout -b feature/fonctionnalite-incroyable

# Faites vos modifications
# Commitez et poussez
git commit -m "Ajout d'une fonctionnalité incroyable"
git push origin feature/fonctionnalite-incroyable

# Ouvrez une Pull Request
```

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](./LICENSE) pour plus de détails.

## 🌟 Options de Déploiement

### Vercel (Recommandé)

[![Déployer avec Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/associationhub/associationhub)

### Railway

[![Déployer sur Railway](https://railway.app/button.svg)](https://railway.app/template/associationhub)

### Docker

```bash
docker compose up -d
```

Voir les [guides de déploiement](./docs/fr/) pour plus d'options.

## 💬 Communauté & Support

- 💬 [Discussions GitHub](https://github.com/associationhub/associationhub/discussions)
- 🐛 [Signaler un Bug](https://github.com/associationhub/associationhub/issues)
- 📧 [Support Email](mailto:support@associationhub.org)

## 🗺️ Feuille de Route

- [x] MVP - Gestion des membres & envoi d'emails
- [ ] Version SaaS multi-tenant
- [ ] Marketplace de templates
- [ ] Application mobile
- [ ] Analyses avancées

## ⭐ Historique des Stars

Si vous trouvez ce projet utile, pensez à lui donner une étoile !

## 🙏 Remerciements

Construit avec ❤️ pour les associations du monde entier.

---

**AssociationHub** - Rendre la gestion d'association agréable
