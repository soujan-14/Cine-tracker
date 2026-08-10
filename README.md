# 🎬 FilmBoxOfficeTracker

A real-time film box office tracking platform built using Next.js, PostgreSQL, Prisma, Socket.io, and TMDB API.

## Features

- Live Box Office
- Movie Search
- Movie Details
- Analytics
- Charts
- AI Predictions
- Admin Dashboard
- Authentication (Supabase)
- Responsive UI

## Environment

```env
DATABASE_URL=postgresql://user:password@host:5432/cinetracker
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
OMDB_API_KEY=<optional, box office data>
```

Auth is handled by Supabase (email + password). API routes read the Supabase
access token from the `Authorization: Bearer` header and mirror the account
into the local `User` table, which owns favorites and watchlist rows.
