-- Persist admin-created movie metadata and distributor collection history.
ALTER TABLE public."Movie"
  ADD COLUMN IF NOT EXISTS "tmdbId" INTEGER,
  ADD COLUMN IF NOT EXISTS "originalTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "overview" TEXT,
  ADD COLUMN IF NOT EXISTS "customBackdrop" TEXT,
  ADD COLUMN IF NOT EXISTS "customCrew" JSONB,
  ADD COLUMN IF NOT EXISTS "customGenres" JSONB,
  ADD COLUMN IF NOT EXISTS "releaseDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "runtime" INTEGER,
  ADD COLUMN IF NOT EXISTS "language" TEXT,
  ADD COLUMN IF NOT EXISTS "budget" DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS "isCustom" BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public."Movie"
SET "tmdbId" = "id"
WHERE "tmdbId" IS NULL AND "id" > 0;

CREATE UNIQUE INDEX IF NOT EXISTS "Movie_tmdbId_key" ON public."Movie" ("tmdbId");

ALTER TABLE public."BoxOffice"
  ADD COLUMN IF NOT EXISTS "collectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "territory" TEXT,
  ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public."BoxOffice"
SET "collectionDate" = "createdAt"
WHERE "collectionDate" IS NULL;

CREATE INDEX IF NOT EXISTS "BoxOffice_movieId_collectionDate_idx"
  ON public."BoxOffice" ("movieId", "collectionDate");
CREATE INDEX IF NOT EXISTS "BoxOffice_distributorId_collectionDate_idx"
  ON public."BoxOffice" ("distributorId", "collectionDate");
