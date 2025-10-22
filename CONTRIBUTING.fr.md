# Contribuer à AssociationHub

> 📖 [English version](./CONTRIBUTING.md)

Merci de votre intérêt pour contribuer à AssociationHub ! Ce document fournit des directives et des instructions pour contribuer.

## 🌟 Façons de Contribuer

- 🐛 Signaler des bugs
- 💡 Suggérer de nouvelles fonctionnalités
- 📝 Améliorer la documentation
- 🔧 Corriger des problèmes
- ✨ Ajouter de nouvelles fonctionnalités
- 🌍 Traduire dans de nouvelles langues
- 🎨 Améliorer l'UI/UX

## 🚀 Démarrage

### 1. Fork et Clone

```bash
# Forkez le dépôt sur GitHub
# Clonez votre fork
git clone https://github.com/VOTRE_NOM/associationhub.git
cd associationhub
```

### 2. Configurer l'Environnement de Développement

```bash
# Installer les dépendances
pnpm install

# Configurer la base de données
pnpm db:setup

# Démarrer le serveur de développement
pnpm dev
```

Voir [QUICKSTART.md](./QUICKSTART.md) pour les instructions détaillées.

### 3. Créer une Branche

```bash
git checkout -b feature/nom-de-votre-fonctionnalite
# ou
git checkout -b fix/votre-correction-de-bug
```

## 📝 Workflow de Développement

### Style de Code

Nous utilisons **Biome** pour le linting et le formatage :

```bash
# Linter le code
pnpm lint

# Formater le code
pnpm --filter web format

# Vérifier les types
pnpm typecheck
```

### Messages de Commit

Suivez [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: ajout de la fonctionnalité d'export des membres
fix: correction du bug d'envoi d'email
docs: mise à jour du README
style: formatage du code
refactor: simplification de la logique d'import des membres
test: ajout de tests pour les templates d'email
chore: mise à jour des dépendances
```

### Tests

```bash
# Exécuter tous les tests
pnpm test

# Exécuter les tests E2E
pnpm test:e2e

# Exécuter les tests en mode watch
pnpm test:watch
```

### Modifications de la Base de Données

```bash
# Créer une migration
pnpm --filter database prisma:migrate

# Générer le Client Prisma
pnpm --filter database prisma:generate

# Voir la base de données
pnpm db:studio
```

## 🎯 Processus de Pull Request

### 1. Avant de Soumettre

- ✅ Le code suit les directives de style du projet
- ✅ Tous les tests passent (`pnpm test`)
- ✅ La vérification des types passe (`pnpm typecheck`)
- ✅ Le linting passe (`pnpm lint`)
- ✅ Documentation mise à jour (si nécessaire)
- ✅ Les messages de commit suivent les conventions

### 2. Soumettre une Pull Request

1. Poussez vos modifications vers votre fork
2. Ouvrez une Pull Request sur GitHub
3. Remplissez le template de PR
4. Liez les issues associées
5. Attendez la revue

### 3. Revue de PR

- Les mainteneurs examineront votre PR
- Adressez les modifications demandées
- Une fois approuvée, votre PR sera fusionnée

## 📚 Structure du Projet

```
association-hub/
├── apps/
│   └── web/              # Application Next.js
│       ├── app/          # Pages App Router
│       ├── locales/      # Traductions i18n
│       └── tests/        # Tests E2E
├── packages/
│   ├── ui/              # Bibliothèque de composants
│   ├── database/        # Prisma + logique DB
│   ├── email/           # Envoi d'emails
│   ├── auth/            # Authentification
│   └── types/           # Types partagés
└── docs/                # Documentation
```

## 🎨 Composants UI

Nous utilisons **shadcn/ui** pour les composants :

```bash
# Ajouter un nouveau composant
cd packages/ui
npx shadcn-ui@latest add button

# Voir les composants dans Storybook
pnpm storybook
```

## 🌍 Traductions

### Ajouter une Nouvelle Langue

1. Créez `apps/web/locales/[lang].json`
2. Copiez la structure de `fr.json` ou `en.json`
3. Traduisez toutes les chaînes
4. Mettez à jour `apps/web/i18n.ts` pour supporter la nouvelle langue

### Mettre à Jour les Traductions

- Éditez `apps/web/locales/fr.json` (Français)
- Éditez `apps/web/locales/en.json` (Anglais)
- Gardez les clés cohérentes entre les langues

## 🐛 Signaler des Bugs

### Avant de Signaler

- Vérifiez si le bug a déjà été signalé
- Essayez de reproduire sur la dernière version
- Rassemblez les informations pertinentes

### Template de Rapport de Bug

```markdown
**Décrivez le bug**
Une description claire du bug.

**Pour Reproduire**
Étapes pour reproduire :
1. Allez sur '...'
2. Cliquez sur '...'
3. Voyez l'erreur

**Comportement attendu**
Ce que vous attendiez qu'il se passe.

**Captures d'écran**
Si applicable, ajoutez des captures d'écran.

**Environnement :**
- OS : [ex., macOS, Ubuntu]
- Navigateur : [ex., Chrome, Firefox]
- Version : [ex., 1.0.0]
```

## 💡 Suggérer des Fonctionnalités

### Template de Demande de Fonctionnalité

```markdown
**Votre demande de fonctionnalité est-elle liée à un problème ?**
Une description claire du problème.

**Décrivez la solution que vous aimeriez**
Une description claire de ce que vous voulez qu'il se passe.

**Décrivez les alternatives que vous avez envisagées**
D'autres solutions auxquelles vous avez pensé.

**Contexte supplémentaire**
Tout autre contexte ou captures d'écran.
```

## 📖 Documentation

### Améliorer la Documentation

- La documentation est dans `/docs/`
- Anglais d'abord (`/docs/en/`), puis Français (`/docs/fr/`)
- Utilisez un langage clair et simple
- Incluez des exemples de code
- Ajoutez des captures d'écran si utile

## ⚖️ Code de Conduite

Veuillez lire et suivre notre [Code de Conduite](./CODE_OF_CONDUCT.fr.md).

## 🙋 Obtenir de l'Aide

- 💬 [Discussions GitHub](https://github.com/associationhub/associationhub/discussions)
- 📧 [Email](mailto:support@associationhub.org)
- 🐛 [Issues](https://github.com/associationhub/associationhub/issues)

## 📜 Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.

## 🎉 Reconnaissance

Les contributeurs seront :
- Listés dans notre README
- Mentionnés dans les notes de version
- Partie de notre communauté

Merci de contribuer à AssociationHub ! 🙏
