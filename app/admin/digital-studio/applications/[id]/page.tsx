import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
import ApplicationDetailClient from './ApplicationDetailClient'

export const dynamic = 'force-dynamic'

export default async function DsApplicationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const application = await db.digitalStudioApplication.findUnique({
    where: { id: params.id },
    include: {
      projects: {
        select: { id: true, projectNumber: true, status: true },
      },
    },
  })

  if (!application) notFound()

  const serialized = {
    ...application,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    lastContactedAt: application.lastContactedAt?.toISOString() ?? null,
    nextActionAt: application.nextActionAt?.toISOString() ?? null,
  }

  return (
    <div className="space-y-6">
      <CulinaryPageHeader
        title={application.businessName}
        description={`Digital Studio application — ${application.status}`}
        actions={
          <Link
            href="/admin/digital-studio"
            className="font-culinary-sans text-xs text-culinary-navy underline"
          >
            ← All applications
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CulinaryCard>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Contact', application.contactName],
                ['Email', application.contactEmail],
                ['Business type', application.businessType],
                ['Website status', application.websiteStatus],
                ['Biggest gap', application.biggestGap],
                ['Timeline', application.timeline],
                ['Source', application.source],
                ['Status', application.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">
                    {label}
                  </dt>
                  <dd className="mt-0.5 font-culinary-sans text-sm text-culinary-ink">
                    {value || '—'}
                  </dd>
                </div>
              ))}
            </dl>
            {application.notes && (
              <div className="mt-4 border-t border-culinary-outline pt-4">
                <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">
                  Notes
                </p>
                <p className="mt-1 font-culinary-sans text-sm text-culinary-ink whitespace-pre-wrap">
                  {application.notes}
                </p>
              </div>
            )}
          </CulinaryCard>
        </div>

        <div>
          <ApplicationDetailClient
            application={serialized}
            existingProjects={application.projects}
          />
        </div>
      </div>
    </div>
  )
}
