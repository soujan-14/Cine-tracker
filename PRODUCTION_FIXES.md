# Production Fixes

- Consolidated navigation and removed duplicate primary navigation rendering.
- Added server-side database role checks for Admin and Distributor routes/APIs.
- Added secure HTTP-only session cookies and logout handling.
- Added persistent custom/admin movie metadata and unified custom + TMDB search.
- Added merged custom movie details, credits, trailers, providers, similar and recommended data.
- Added persistent distributor collection date/territory records and public local box-office rankings.
- Added dashboard Back to Home controls and responsive dashboard layouts.
- Removed hardcoded TMDB credentials and insecure JWT fallback.
- Updated Next 16 ESLint configuration and CI lint/build validation.
- Removed invented OTT fallback URLs from the movie-detail Watch Now action.
- Centralized Cine Tracker branding around the shared red C logo and `/favicon.svg`.

## Validation
- GitHub Actions run 96 passed `npm run lint` and `npm run build` on the pull-request merge ref.
- Build completed successfully with Next.js 16.3.0 and Prisma Client 5.22.0.
