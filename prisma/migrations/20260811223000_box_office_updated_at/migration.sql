-- Track the last modification time for distributor collection records.
ALTER TABLE public."BoxOffice"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE public."BoxOffice"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;
