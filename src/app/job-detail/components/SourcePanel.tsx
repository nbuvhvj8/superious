'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { SourceStatusBadge, type SourceStatus } from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import AppImage from '@/components/ui/AppImage';

interface Source {
  id: string;
  url: string;
  title: string;
  domain: string;
  summary: string;
  screenshotUrl: string;
  faviconUrl: string;
  capturedAt: string;
  status: SourceStatus;
}

// TODO: Replace with SSE source events from GET /api/v1/script/:jobId/stream
const MOCK_SOURCES: Source[] = [
{
  id: 'src-001',
  url: 'https://www.nature.com/articles/d41586-023-03697-w',
  title: 'CRISPR cancer therapy: the next frontier in precision oncology',
  domain: 'nature.com',
  summary: 'Comprehensive overview of CRISPR-based cancer therapies currently in clinical trials, covering CAR-T cell engineering approaches and early efficacy data from Phase 1 and 2 studies.',
  screenshotUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_142ca58b4-1771896405786.png",
  faviconUrl: 'https://www.google.com/s2/favicons?domain=nature.com&sz=32',
  capturedAt: '2026-05-04T18:45:12Z',
  status: 'done'
},
{
  id: 'src-002',
  url: 'https://www.science.org/doi/10.1126/science.aat5172',
  title: 'A programmable dual-RNA–guided DNA endonuclease in adaptive bacterial immunity',
  domain: 'science.org',
  summary: 'The foundational 2012 Doudna-Charpentier paper establishing CRISPR-Cas9 as a programmable genome editing tool, covering molecular mechanism and initial experimental validation.',
  screenshotUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_151487bb0-1767590642596.png",
  faviconUrl: 'https://www.google.com/s2/favicons?domain=science.org&sz=32',
  capturedAt: '2026-05-04T18:45:28Z',
  status: 'done'
},
{
  id: 'src-003',
  url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2309915',
  title: 'CRISPR-Cas9 Gene Editing for Sickle Cell Disease and β-Thalassemia',
  domain: 'nejm.org',
  summary: 'New England Journal of Medicine clinical trial results for Casgevy (exagamglogene autotemcel), reporting outcomes for 45 patients with severe sickle cell disease treated with CRISPR gene therapy.',
  screenshotUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_14799fecf-1775018426341.png",
  faviconUrl: 'https://www.google.com/s2/favicons?domain=nejm.org&sz=32',
  capturedAt: '2026-05-04T18:45:44Z',
  status: 'done'
},
{
  id: 'src-004',
  url: 'https://www.statnews.com/2023/12/08/crispr-therapy-approved-fda-sickle-cell/',
  title: 'FDA approves first CRISPR therapy — a milestone for gene editing',
  domain: 'statnews.com',
  summary: 'STAT News coverage of the FDA approval of Casgevy in December 2023, including pricing analysis at $2.2 million per treatment and equity concerns around access for affected populations.',
  screenshotUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_12b48922a-1766323260826.png",
  faviconUrl: 'https://www.google.com/s2/favicons?domain=statnews.com&sz=32',
  capturedAt: '2026-05-04T18:46:01Z',
  status: 'done'
},
{
  id: 'src-005',
  url: 'https://www.cancer.gov/research/areas/treatment/crispr',
  title: 'CRISPR in Cancer Research — National Cancer Institute',
  domain: 'cancer.gov',
  summary: 'NCI overview of ongoing CRISPR research programs in oncology, covering funded trials, mechanism of action in T-cell engineering, and the regulatory pathway for CRISPR-based cancer treatments.',
  screenshotUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1fa90bf5e-1777123101595.png",
  faviconUrl: 'https://www.google.com/s2/favicons?domain=cancer.gov&sz=32',
  capturedAt: '2026-05-04T18:46:18Z',
  status: 'done'
},
{
  id: 'src-006',
  url: 'https://www.who.int/publications/i/item/9789240030381',
  title: 'WHO Expert Advisory Committee on Human Genome Editing — Recommendations',
  domain: 'who.int',
  summary: 'WHO 2021 recommendations on governance of human genome editing, calling for a global registry of germline editing research and mandatory international pre-approval before any clinical germline application.',
  screenshotUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_197888080-1769443513090.png",
  faviconUrl: 'https://www.google.com/s2/favicons?domain=who.int&sz=32',
  capturedAt: '2026-05-04T18:46:35Z',
  status: 'done'
},
{
  id: 'src-007',
  url: 'https://www.bmj.com/content/383/bmj-2023-076714',
  title: 'Ethical frameworks for CRISPR in clinical oncology — a systematic review',
  domain: 'bmj.com',
  summary: 'BMJ systematic review of ethical frameworks proposed for CRISPR cancer therapies, covering consent requirements, equity in access, and the distinction between somatic and germline editing.',
  screenshotUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1da386338-1767365955857.png",
  faviconUrl: 'https://www.google.com/s2/favicons?domain=bmj.com&sz=32',
  capturedAt: '2026-05-04T18:46:52Z',
  status: 'done'
},
{
  id: 'src-008',
  url: 'https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(24)00123-5',
  title: 'Prime editing and base editing in oncology: the next generation of CRISPR',
  domain: 'thelancet.com',
  summary: 'Lancet Oncology review of next-generation CRISPR variants — base editing and prime editing — covering reduced off-target effects, current clinical applications, and 5-year horizon for solid tumor treatment.',
  screenshotUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1a4ef1a27-1773250789316.png",
  faviconUrl: 'https://www.google.com/s2/favicons?domain=thelancet.com&sz=32',
  capturedAt: '2026-05-04T18:47:08Z',
  status: 'done'
}];


interface Props {
  highlightedSourceId: string | null;
  onSourceClick: (sourceId: string) => void;
}

export default function SourcePanel({ highlightedSourceId, onSourceClick }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [modalSource, setModalSource] = useState<Source | null>(null);

  // Simulate SSE source reveal — sources appear one-by-one
  useEffect(() => {
    if (visibleCount >= MOCK_SOURCES.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, 350);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  const visibleSources = MOCK_SOURCES.slice(0, visibleCount);
  const failedCount = visibleSources.filter((s) => s.status === 'failed').length;
  const doneCount = visibleSources.filter((s) => s.status === 'done').length;

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Panel Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Source Evidence</h3>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {doneCount}/{MOCK_SOURCES.length}
          </span>
        </div>
        {failedCount > 0 &&
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle size={13} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium">
              {failedCount} source{failedCount > 1 ? 's' : ''} failed to capture
            </p>
          </div>
        }
        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${doneCount / MOCK_SOURCES.length * 100}%` }} />
          
        </div>
      </div>

      {/* Source Cards */}
      <div className="space-y-3">
        {visibleSources.map((source) =>
        <SourceCard
          key={source.id}
          source={source}
          isHighlighted={highlightedSourceId === source.id}
          onClick={() => onSourceClick(source.id)}
          onThumbnailClick={() => setModalSource(source)} />

        )}
        {visibleCount < MOCK_SOURCES.length &&
        <div className="card p-4 animate-pulse space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
            <div className="h-24 bg-muted rounded-lg" />
            <div className="h-2.5 bg-muted rounded w-full" />
            <div className="h-2.5 bg-muted rounded w-5/6" />
          </div>
        }
      </div>

      {/* Screenshot Modal */}
      {modalSource &&
      <Modal
        open={!!modalSource}
        onClose={() => setModalSource(null)}
        size="full">
        
          <div className="space-y-0">
            <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-bold text-foreground line-clamp-2">{modalSource.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">{modalSource.domain}</span>
                  <span className="text-muted-foreground text-xs">&bull;</span>
                  <span className="font-mono text-2xs text-muted-foreground">
                    Captured {new Date(modalSource.capturedAt).toLocaleString('en-GB')}
                  </span>
                </div>
                <a
                href={modalSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-2xs text-primary hover:underline font-medium">
                
                  {modalSource.url.length > 70 ? modalSource.url.slice(0, 70) + '…' : modalSource.url}
                  <ExternalLink size={10} />
                </a>
              </div>
              <button
              onClick={() => setModalSource(null)}
              className="btn-ghost p-1.5 shrink-0"
              aria-label="Close screenshot">
              
                ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh]">
              <AppImage
              src={modalSource.screenshotUrl}
              alt={`Full page screenshot of ${modalSource.title} captured from ${modalSource.domain}`}
              width={1440}
              height={900}
              className="w-full h-auto"
              unoptimized />
            
            </div>
          </div>
        </Modal>
      }
    </div>);

}

function SourceCard({ source, isHighlighted, onClick, onThumbnailClick




}: {source: Source;isHighlighted: boolean;onClick: () => void;onThumbnailClick: () => void;}) {
  return (
    <div
      className={`
        card p-4 space-y-3 cursor-pointer transition-all duration-200 animate-fade-in
        ${isHighlighted ?
      'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/40 hover:shadow-md'}
      `
      }
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') onClick();}}
      aria-label={`Source: ${source.title}`}>
      
      {/* Card Header */}
      <div className="flex items-start gap-2.5">
        <div className="w-5 h-5 rounded shrink-0 mt-0.5 overflow-hidden bg-muted">
          <AppImage
            src={source.faviconUrl}
            alt={`${source.domain} favicon`}
            width={20}
            height={20}
            className="w-full h-full object-contain"
            unoptimized />
          
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug">{source.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xs text-muted-foreground font-medium">{source.domain}</span>
            <SourceStatusBadge status={source.status} />
          </div>
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn-ghost p-1 shrink-0"
          aria-label={`Open ${source.domain} in new tab`}>
          
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Screenshot Thumbnail */}
      {source.status === 'done' &&
      <button
        onClick={(e) => {e.stopPropagation();onThumbnailClick();}}
        className="w-full block rounded-lg overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all duration-150 group"
        aria-label={`View full screenshot of ${source.title}`}>
        
          <div className="relative">
            <AppImage
            src={source.screenshotUrl}
            alt={`Screenshot thumbnail of ${source.title} — ${source.domain} webpage captured during research`}
            width={400}
            height={225}
            className="w-full h-[120px] object-cover object-top group-hover:opacity-90 transition-opacity"
            unoptimized />
          
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-150 flex items-center justify-center">
              <span className="text-white text-xs font-semibold bg-foreground/60 px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                View screenshot
              </span>
            </div>
          </div>
        </button>
      }

      {source.status === 'failed' &&
      <div className="w-full h-[80px] rounded-lg border border-red-200 bg-red-50 flex items-center justify-center gap-2">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-xs text-red-500 font-medium">Screenshot capture failed</span>
        </div>
      }

      {/* Summary */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{source.summary}</p>

      {/* Capture time */}
      {source.status === 'done' &&
      <p className="font-mono text-2xs text-muted-foreground">
          Captured {new Date(source.capturedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      }
    </div>);

}