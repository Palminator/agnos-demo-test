# Agnos Demo Test (Frontend)

Path '/client' for test input form
Path '/staff' for test monitor data real-time

Quick setup and notes for the frontend portion of the project.

## Requirements
- Node.js 18+ and npm (or pnpm/yarn).

## Setup
1. Install dependencies:

```bash
npm install
```

2. Configure environment (create `.env.local` at repo root):

- `NEXT_PUBLIC_SUPABASE_URL`: your Supabase URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: anon/public key

Example `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-instance.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...your_public_key
```

3. Run the dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm start
```
