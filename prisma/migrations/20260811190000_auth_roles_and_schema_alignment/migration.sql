-- Align the production database with prisma/schema.prisma.
-- Cine Tracker uses its own JWT auth and public.User table; Supabase Auth is not
-- the identity source for this application, so role authorization remains in
-- the Next.js server layer via the signed JWT role claim.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'DISTRIBUTOR');
  END IF;
END $$;

ALTER TABLE public."User"
  ADD COLUMN IF NOT EXISTS "password" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER';

CREATE TABLE IF NOT EXISTS public."Movie" (
  "id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "customBoxOffice" DECIMAL(18,2),
  "customPoster" TEXT,
  "customTrailer" TEXT,
  "customCast" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."BoxOffice" (
  "id" TEXT NOT NULL,
  "movieId" INTEGER NOT NULL,
  "distributorId" TEXT NOT NULL,
  "dailyCollection" DECIMAL(18,2),
  "weekendCollection" DECIMAL(18,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BoxOffice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BoxOffice_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES public."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BoxOffice_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "BoxOffice_movieId_createdAt_idx" ON public."BoxOffice" ("movieId", "createdAt");
CREATE INDEX IF NOT EXISTS "BoxOffice_distributorId_createdAt_idx" ON public."BoxOffice" ("distributorId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_movieId_key" ON public."Favorite" ("userId", "movieId");
CREATE UNIQUE INDEX IF NOT EXISTS "Watchlist_userId_movieId_key" ON public."Watchlist" ("userId", "movieId");

UPDATE public."User" SET "role" = 'ADMIN' WHERE lower("email") = 'soujan1407@gmail.com';
UPDATE public."User" SET "role" = 'DISTRIBUTOR' WHERE lower("email") = 'om123@gmail.com';
