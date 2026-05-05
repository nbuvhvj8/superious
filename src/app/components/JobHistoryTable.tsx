'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, ExternalLink, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { JobStatusBadge, type JobStatus } from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Job {
  id: string;
  prompt: string;
  status: JobStatus;
  sourcesCount: number;
  wordCount: number | null;
  estimatedDuration: string | null;
  createdAt: string;
}

// TODO: Replace with GET /api/v1/jobs?page=X&limit=20&status=Y
const MOCK_JOBS: Job[] = [
  {
    id: 'job-2847fa',
    prompt:
      'The rise and fall of Blockbuster Video — corporate decisions, Netflix rivalry, and lessons for modern media companies',
    status: 'screenshotting',
    sourcesCount: 5,
    wordCount: null,
    estimatedDuration: null,
    createdAt: '2026-05-04T21:18:00Z',
  },
  {
    id: 'job-1c93be',
    prompt:
      'How CRISPR gene editing is revolutionizing cancer treatment and what ethical frameworks are needed',
    status: 'done',
    sourcesCount: 8,
    wordCount: 2840,
    estimatedDuration: '21m 50s',
    createdAt: '2026-05-04T18:44:00Z',
  },
  {
    id: 'job-8d72ac',
    prompt:
      'The science behind why we dream — neuroscience, memory consolidation, and lucid dreaming research',
    status: 'done',
    sourcesCount: 7,
    wordCount: 2610,
    estimatedDuration: '20m 5s',
    createdAt: '2026-05-03T14:22:00Z',
  },
  {
    id: 'job-5e41df',
    prompt:
      'Nuclear fusion energy: ITER project timeline, recent breakthroughs, and realistic path to commercial power',
    status: 'done',
    sourcesCount: 8,
    wordCount: 3120,
    estimatedDuration: '24m 0s',
    createdAt: '2026-05-03T09:11:00Z',
  },
  {
    id: 'job-3b19cc',
    prompt:
      'TikTok algorithm deep dive — how content is ranked, why it is addictive, and its impact on attention spans',
    status: 'failed',
    sourcesCount: 3,
    wordCount: null,
    estimatedDuration: null,
    createdAt: '2026-05-02T22:07:00Z',
  },
  {
    id: 'job-7f64aa',
    prompt:
      'Lab-grown meat industry: current state, cost trajectory, regulatory landscape, and consumer adoption barriers',
    status: 'done',
    sourcesCount: 8,
    wordCount: 2950,
    estimatedDuration: '22m 41s',
    createdAt: '2026-05-02T16:30:00Z',
  },
  {
    id: 'job-9a82cd',
    prompt:
      'History of solar energy in Africa — adoption rates, off-grid solutions, and economic impact on rural communities',
    status: 'done',
    sourcesCount: 8,
    wordCount: 2780,
    estimatedDuration: '21m 23s',
    createdAt: '2026-05-01T11:45:00Z',
  },
  {
    id: 'job-4c55ef',
    prompt:
      'Why the Roman Empire really collapsed — economic, military, and climate factors beyond the traditional narrative',
    status: 'done',
    sourcesCount: 8,
    wordCount: 3050,
    estimatedDuration: '23m 28s',
    createdAt: '2026-04-30T09:00:00Z',
  },
  {
    id: 'job-2d87bc',
    prompt:
      'The future of remote work — productivity research, hybrid model outcomes, and office real estate implications',
    status: 'done',
    sourcesCount: 7,
    wordCount: 2420,
    estimatedDuration: '18m 37s',
    createdAt: '2026-04-29T15:20:00Z',
  },
  {
    id: 'job-6e13fa',
    prompt:
      'Quantum computing explained — current qubit counts, decoherence challenges, and first practical use cases',
    status: 'failed',
    sourcesCount: 2,
    wordCount: null,
    estimatedDuration: null,
    createdAt: '2026-04-28T20:11:00Z',
  },
];

const STATUS_FILTERS: { key: string; label: string; value: JobStatus | 'all' }[] = [
  { key: 'filter-all', label: 'All', value: 'all' },
  { key: 'filter-done', label: 'Done', value: 'done' },
  { key: 'filter-researching', label: 'In Progress', value: 'researching' },
  { key: 'filter-failed', label: 'Failed', value: 'failed' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function JobHistoryTable() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const PER_PAGE = 8;

  const filtered = MOCK_JOBS.filter(
    (j) => !deletedIds.has(j.id) && (statusFilter === 'all' || j.status === statusFilter)
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    // TODO: Connect to DELETE /api/v1/jobs/:jobId
    await new Promise((r) => setTimeout(r, 900));
    setDeletedIds((prev) => new Set([...prev, deleteTarget]));
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="card overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground mr-2">Status</span>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
                className={`
                  text-xs px-3 py-1 rounded-full font-semibold border transition-all duration-150
                  ${
                    statusFilter === f.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {filtered.length} job{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[40%]">
                  Prompt
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sources
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Duration
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">No jobs found</p>
                      <p className="text-xs text-muted-foreground">
                        {statusFilter !== 'all'
                          ? `No jobs with status "${statusFilter}". Try a different filter.`
                          : 'Submit your first research prompt above to get started.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((job, i) => (
                  <tr
                    key={job.id}
                    className={`
                      border-b border-border last:border-0 group
                      hover:bg-muted/40 transition-colors duration-100
                      ${i % 2 === 0 ? '' : 'bg-muted/20'}
                    `}
                  >
                    <td className="px-5 py-3.5">
                      <Link href="/job-detail" className="block max-w-xs xl:max-w-sm 2xl:max-w-md">
                        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors">
                          {job.prompt}
                        </p>
                        <span className="font-mono text-2xs text-muted-foreground mt-0.5 block">
                          {job.id}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-sm tabular-nums font-semibold text-foreground">
                        {job.sourcesCount}
                        <span className="text-muted-foreground font-normal">/8</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {job.estimatedDuration ? (
                        <span className="font-mono text-xs tabular-nums text-foreground">
                          {job.estimatedDuration}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">
                          {formatDate(job.createdAt)}
                        </p>
                        <p className="font-mono text-2xs text-muted-foreground">
                          {formatTime(job.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Link
                          href="/job-detail"
                          className="btn-ghost p-1.5 relative group/btn"
                          aria-label="View job detail"
                        >
                          <ExternalLink size={14} />
                          <span
                            className="
                            absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2
                            px-2 py-1 rounded bg-foreground text-background text-2xs font-medium
                            whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none
                            transition-opacity duration-150 z-10
                          "
                          >
                            View detail
                          </span>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(job.id)}
                          className="btn-ghost p-1.5 hover:text-red-500 relative group/btn"
                          aria-label="Delete job"
                        >
                          <Trash2 size={14} />
                          <span
                            className="
                            absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2
                            px-2 py-1 rounded bg-foreground text-background text-2xs font-medium
                            whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none
                            transition-opacity duration-150 z-10
                          "
                          >
                            Delete job
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost p-1.5 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={`page-${i + 1}`}
                  onClick={() => setPage(i + 1)}
                  className={`
                    w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-150
                    ${
                      page === i + 1
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost p-1.5 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Job"
        description="This will permanently delete the job, its script, all source records, and associated screenshots from storage. This cannot be undone."
        confirmLabel="Delete Job"
        loading={deleting}
      />
    </>
  );
}
