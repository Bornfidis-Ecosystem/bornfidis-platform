import Link from 'next/link'
import { db } from '@/lib/db'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'

export const dynamic = 'force-dynamic'

export default async function AdminDigitalStudioPage() {
  const [applications, projects] = await Promise.all([
    db.digitalStudioApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.digitalStudioProject.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        _count: { select: { tasks: true } },
        tasks: { where: { status: 'completed' }, select: { id: true } },
      },
    }),
  ])

  const activeProjects = projects.filter((p) =>
    !['completed', 'cancelled', 'paused'].includes(p.status),
  )
  const awaitingInput = projects.filter((p) => p.status === 'client_review')

  return (
    <div className="space-y-8">
      <CulinaryPageHeader
        title="Digital Studio"
        description="Applications, projects, and delivery pipeline."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CulinaryCard>
          <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
            Open Applications
          </p>
          <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">
            {applications.filter((a) => !['declined', 'completed', 'in_progress'].includes(a.status)).length}
          </p>
        </CulinaryCard>
        <CulinaryCard>
          <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
            Active Projects
          </p>
          <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">
            {activeProjects.length}
          </p>
        </CulinaryCard>
        <CulinaryCard>
          <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
            Awaiting Client Input
          </p>
          <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">
            {awaitingInput.length}
          </p>
        </CulinaryCard>
      </div>

      {/* Active Projects */}
      <section>
        <h2 className="mb-3 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted">
          Projects
        </h2>
        {projects.length === 0 ? (
          <CulinaryCard>
            <p className="font-culinary-sans text-sm text-culinary-text-muted">
              No Digital Studio projects yet. Create one from an accepted application.
            </p>
          </CulinaryCard>
        ) : (
          <CulinaryCard padded={false} className="overflow-hidden">
            <div className="divide-y divide-culinary-outline">
              {projects.map((p) => {
                const completedCount = p.tasks.length
                const totalCount = p._count.tasks
                const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
                return (
                  <Link
                    key={p.id}
                    href={`/admin/digital-studio/${p.id}`}
                    className="flex items-center justify-between gap-4 px-gutter py-3 transition hover:bg-culinary-surface-low"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-culinary-sans text-sm font-semibold text-culinary-ink">
                        {p.projectNumber} — {p.name}
                      </p>
                      <p className="mt-0.5 font-culinary-sans text-xs text-culinary-text-muted">
                        {p.clientName} · {p.status} · {p.phase}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-culinary-sans text-xs tabular-nums text-culinary-navy">
                        {pct}%
                      </span>
                      <div className="h-2 w-24 rounded-full bg-culinary-outline">
                        <div
                          className="h-2 rounded-full bg-culinary-forest"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CulinaryCard>
        )}
      </section>

      {/* Applications Pipeline */}
      <section>
        <h2 className="mb-3 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted">
          Applications
        </h2>
        {applications.length === 0 ? (
          <CulinaryCard>
            <p className="font-culinary-sans text-sm text-culinary-text-muted">
              No Digital Studio applications yet.
            </p>
          </CulinaryCard>
        ) : (
          <CulinaryCard padded={false} className="overflow-hidden">
            <div className="divide-y divide-culinary-outline">
              {applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/admin/digital-studio/applications/${app.id}`}
                  className="flex items-center justify-between gap-4 px-gutter py-3 transition hover:bg-culinary-surface-low"
                >
                  <div className="min-w-0">
                    <p className="truncate font-culinary-sans text-sm font-semibold text-culinary-ink">
                      {app.businessName}
                    </p>
                    <p className="mt-0.5 font-culinary-sans text-xs text-culinary-text-muted">
                      {app.contactName} · {app.contactEmail}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-none px-2 py-0.5 font-culinary-sans text-[10px] font-bold uppercase ${
                      app.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : app.status === 'in_progress'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </Link>
              ))}
            </div>
          </CulinaryCard>
        )}
      </section>
    </div>
  )
}
