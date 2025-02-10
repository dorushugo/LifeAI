# HistoryAI - Application Web

Application Next.js 15 avec TypeScript pour la gestion interactive de l'histoire des guerres.

## 🚀 Technologies utilisées

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Authentification** : Better-auth avec gestion de sessions
- **IA** : VERCEL AI SDK avec Groq et OpenAI
- **Stylage** : Tailwind CSS + Geist UI
- **PDF** : jsPDF pour la génération de fiches
- **Autres** : Supabase, Zod, React Hot Toast

## ⚙️ Lancer le projet :

Créer un fichier `.env` à la racine contenant vos clefs :
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_SERVICE_ROLE_KEY=

DATABASE_URL=
DATABASE_AUTH_URL=
POSTGRES_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

ELEVENLABS_API_KEY=
GROQ_API_KEY=

Installer les dépendances :

- Aller dans le dossier webapp
- pnpm install
- npm run dev

## 🧠 Fonctionnalités IA

- Génération de quiz personnalisés
- Création de fiches de révision
- Synthèse vocale des contenus
- Recherche contextuelle dans les documents

## 🚀 Déploiement

Nous conseillons de déployer sur Vercel

## 📚 Documentation technique

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [AI SDK](https://vercel.com/docs/ai)
