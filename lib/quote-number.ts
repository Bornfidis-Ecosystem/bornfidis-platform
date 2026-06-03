import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

/**
 * DB client or interactive transaction client (both expose `$queryRaw`).
 * Call `allocateNextQuoteNumber` on the **same** `tx` that creates the `quotes` row so the
 * sequence bump rolls back if the insert fails.
 */
export type DbForQuoteSequence = Pick<PrismaClient, '$queryRaw'>

const QUOTE_REF_PATTERN = /^BF-(\d{4})-(\d+)$/

export function getUtcYear(): number {
  return new Date().getUTCFullYear()
}

function coerceSeq(value: unknown): number {
  if (typeof value === 'bigint') {
    const n = Number(value)
    if (!Number.isSafeInteger(n)) {
      throw new Error('Quote sequence overflow')
    }
    return n
  }
  const n = Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error('Invalid quote sequence from database')
  }
  return n
}

/**
 * Atomically allocates the next quote number for the current UTC calendar year.
 *
 * **Concurrency:** Uses a single row per year in `quote_sequences` with
 * `INSERT … ON CONFLICT … DO UPDATE … RETURNING`. PostgreSQL serializes conflicting
 * updates on that row, so two sessions cannot receive the same `last_value`.
 *
 * **Trust:** Values are parameterized (`Prisma.sql`); no string concatenation of user input.
 */
export async function allocateNextQuoteNumber(db: DbForQuoteSequence): Promise<string> {
  const year = getUtcYear()
  if (year < 2000 || year > 2100) {
    throw new Error('Refusing to allocate quote number: invalid UTC year')
  }

  const rows = await db.$queryRaw<Array<{ last_value: unknown }>>(
    Prisma.sql`
      INSERT INTO quote_sequences (year, last_value, updated_at)
      VALUES (${year}, 1, NOW())
      ON CONFLICT (year) DO UPDATE
      SET
        last_value = quote_sequences.last_value + 1,
        updated_at = NOW()
      RETURNING last_value
    `,
  )

  const seq = coerceSeq(rows[0]?.last_value)
  if (seq < 1) {
    throw new Error('Invalid quote sequence: must be >= 1')
  }

  const padded = String(seq).padStart(4, '0')
  const ref = `BF-${year}-${padded}`

  if (!QUOTE_REF_PATTERN.test(ref)) {
    throw new Error('Quote reference format invariant failed')
  }

  return ref
}
