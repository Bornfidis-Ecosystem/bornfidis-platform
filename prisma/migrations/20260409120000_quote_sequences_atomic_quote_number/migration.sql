-- Atomic per-year quote reference allocation (see lib/quote-number.ts)

CREATE TABLE "quote_sequences" (
    "year" INTEGER NOT NULL,
    "last_value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_sequences_pkey" PRIMARY KEY ("year")
);

ALTER TABLE "quotes" ADD COLUMN "quote_number" TEXT;

CREATE UNIQUE INDEX "quotes_quote_number_key" ON "quotes"("quote_number");
