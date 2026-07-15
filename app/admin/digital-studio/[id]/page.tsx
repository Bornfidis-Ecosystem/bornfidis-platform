import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
import { DS_PROJECT_STATUSES, DS_PROJECT_PHASES, getProjectTaskStats } from '@/lib/digital-studio-projects'
import ProjectDetailClient from './ProjectDetailClient'
import { formatUSD } from '@/lib/money'

export const dynamic = 'force-dynamic'

export default async function DsProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const project = await db.digitalStudioProject.findUnique({
    where: { id: params.id },
    include: {
      tasks: { orderBy: { order: 'asc' } },
      application: { select: { id: true, businessName: true } },
    },
  })

  if (!project) notFound()

  const stats = await getProjectTaskStats(project.id)

  const serializedTasks = project.tasks.map((t) => ({
    ...t,
    dueAt: t.dueAt?.toISOString() ?? null,
    completedAt: t.completedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <CulinaryPageHeader
        title={`${project.projectNumber} — ${project.name}`}
        description={`${project.clientName} · ${project.phase} · ${stats.percentComplete}% complete`}
        actions={
          <Link
            href="/admin/digital-studio"
            className="font-culinary-sans text-xs text-culinary-navy underline"
          >
            ← All projects
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CulinaryCard>
          <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Status</p>
          <p className="mt-1 font-culinary-sans text-sm font-semibold text-culinary-ink">{project.status}</p>
        </CulinaryCard>
        <CulinaryCard>
          <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Phase</p>
          <p className="mt-1 font-culinary-sans text-sm font-semibold text-culinary-ink">{project.phase}</p>
        </CulinaryCard>
        <CulinaryCard>
          <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Total</p>
          <p className="mt-1 font-culinary-sans text-sm font-semibold tabular-nums text-culinary-ink">
            {project.totalAmountCents ? formatUSD(project.totalAmountCents) : '—'}
          </p>
        </CulinaryCard>
        <CulinaryCard>
          <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">Progress</p>
          <p className="mt-1 font-culinary-sans text-sm font-semibold tabular-nums text-culinary-ink">
            {stats.completed}/{stats.total} tasks
          </p>
        </CulinaryCard>
      </div>

      <ProjectDetailClient
        project={{
          id: project.id,
          status: project.status,
          phase: project.phase,
          projectNumber: project.projectNumber,
        }}
        tasks={serializedTasks}
        statuses={DS_PROJECT_STATUSES as unknown as string[]}
        phases={DS_PROJECT_PHASES as unknown as string[]}
      />

      {project.application && (
        <CulinaryCard>
          <p className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">
            Original Application
          </p>
          <Link
            href={`/admin/digital-studio/applications/${project.application.id}`}
            className="mt-1 inline-block font-culinary-sans text-sm text-culinary-navy underline"
          >
            {project.application.businessName}
          </Link>
        </CulinaryCard>
      )}
    </div>
  )
}
