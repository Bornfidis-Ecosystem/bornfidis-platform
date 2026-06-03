import { db } from '@/lib/db'

type EnsureClientProfileInput = {
  name: string
  email?: string | null
  phone?: string | null
}

function normalizeEmail(email?: string | null) {
  const value = (email || '').trim().toLowerCase()
  return value.length > 0 ? value : null
}

function normalizePhone(phone?: string | null) {
  const value = (phone || '').trim()
  return value.length > 0 ? value : null
}

export async function ensureClientProfile(input: EnsureClientProfileInput): Promise<{ id: string }> {
  const phone = normalizePhone(input.phone)
  const email = normalizeEmail(input.email)
  const name = input.name.trim() || 'Client'

  let existing = null as Awaited<ReturnType<typeof db.clientProfile.findFirst>> | null
  if (phone) {
    existing = await db.clientProfile.findFirst({ where: { phone } })
  }
  if (!existing && email) {
    existing = await db.clientProfile.findFirst({ where: { email } })
  }

  if (existing) {
    const shouldUpdateName = !existing.name || existing.name.trim().length === 0
    const shouldUpdateEmail = !existing.email && !!email
    const shouldUpdatePhone = !existing.phone && !!phone

    if (shouldUpdateName || shouldUpdateEmail || shouldUpdatePhone) {
      await db.clientProfile.update({
        where: { id: existing.id },
        data: {
          name: shouldUpdateName ? name : undefined,
          email: shouldUpdateEmail ? email : undefined,
          phone: shouldUpdatePhone ? phone : undefined,
        },
      })
    }
    return { id: existing.id }
  }

  const created = await db.clientProfile.create({
    data: {
      name,
      email,
      phone,
    },
    select: { id: true },
  })

  return created
}

