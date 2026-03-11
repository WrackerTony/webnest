# WebNest

A bookmark and link manager where you can save, organize, and track your favorite websites.

## What It Does

- **Save websites** with titles, descriptions, tags, and ratings
- **Organize** bookmarks into categories
- **Search** through your saved links
- **Analytics** dashboard to see your most clicked and highest rated sites
- **User accounts** with email/password authentication

## Built With

- **Next.js 16** (React 19, App Router, TypeScript)
- **Convex** (serverless backend + real-time database)
- **Tailwind CSS 4**
- **Lucide Icons**
- Deployed on **Vercel**

## Setup

1. Clone and install:

```bash
git clone https://github.com/WrackerTony/webnest.git
cd webnest
npm install
```

2. Start Convex backend:

```bash
npx convex dev
```

3. Create `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

**Vercel**: Connect your repo, set the `NEXT_PUBLIC_CONVEX_URL` env variable, and deploy.

**Convex backend**: `npx convex deploy`
