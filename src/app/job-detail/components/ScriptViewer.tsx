'use client';

import React, { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert01Icon, ArrowDown01Icon, CodeIcon, Download01Icon, File02Icon, HashtagIcon, PencilEdit01Icon, RotateLeft01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import ScriptEditor from './ScriptEditor';
import HookVariantsModal from './HookVariantsModal';
import { VerificationBadge, VerificationLegend } from './VerificationBadge';
import type { HookVariant, SegmentVerification, VerificationStatus } from '@/server/types';

interface ScriptSegment {
  id: string;
  order: number;
  heading: string;
  narration: string;
  bRollCues: string[];
  sourceIds: string[];
  durationS: number;
  verification: SegmentVerification;
}

interface ScriptData {
  title: string;
  hook: string;
  hookSourceIds: string[];
  hookVerification: SegmentVerification;
  segments: ScriptSegment[];
  outro: string;
  outroSourceIds: string[];
  outroVerification: SegmentVerification;
  wordCount: number;
  estimatedDurationS: number;
}

const MOCK_SCRIPT: ScriptData = {
  title: 'CRISPR & Cancer: The Gene Editing Revolution',
  hook: "Imagine being told you have cancer — and then, six months later, doctors use a molecular pair of scissors to snip the disease out of your DNA. This isn't science fiction. It happened. And the technology behind it is rewriting the rules of medicine faster than anyone expected.",
  hookSourceIds: ['src-001', 'src-002'],
  segments: [
    {
      id: 'seg-001',
      order: 1,
      heading: 'What Is CRISPR and How Does It Work?',
      narration:
        "CRISPR-Cas9 is essentially a bacterial immune system that scientists have repurposed as a precision genome editing tool. The Cas9 protein acts like molecular scissors, guided by a short RNA sequence to a specific location in the DNA strand. Once there, it makes a targeted double-strand cut. The cell's natural repair machinery then either disables the gene or — in more advanced applications — inserts a corrected sequence. What took decades of work with older tools now takes days. The precision is measured in individual base pairs out of 3 billion.",
      bRollCues: [
        'Animation of Cas9 protein binding to DNA double helix',
        'Lab footage of scientists pipetting samples in blue-lit lab',
        'Close-up of DNA sequencing gel electrophoresis',
        'Graphic showing base pair targeting mechanism',
      ],
      sourceIds: ['src-001', 'src-003'],
      durationS: 285,
      verification: {
        status: 'supported',
        confidence: 0.94,
        supportingSourceIds: ['src-001', 'src-003'],
        contradictingSourceIds: [],
        notes: 'Mechanism described matches both Nature and NEJM coverage.',
      },
    },
    {
      id: 'seg-002',
      order: 2,
      heading: 'Key Milestones: From Discovery to Clinical Trials',
      narration:
        "The CRISPR story accelerates remarkably fast. Jennifer Doudna and Emmanuelle Charpentier published the foundational paper in 2012 — they won the Nobel Prize in Chemistry just eight years later. By 2016, the first human CRISPR clinical trial began in China. In 2020, the first US trial launched for sickle cell disease. Then in November 2023, the FDA approved Casgevy — the world's first CRISPR-based therapy — for sickle cell disease and beta-thalassemia. Cancer applications have followed closely, with T-cell engineering trials showing response rates above 70% in some blood cancer cohorts.",
      bRollCues: [
        'Photo of Doudna and Charpentier receiving Nobel Prize',
        'Timeline graphic 2012–2023 showing key milestones',
        'Hospital oncology ward footage',
        'FDA approval document graphic',
      ],
      sourceIds: ['src-002', 'src-004', 'src-005'],
      durationS: 310,
      verification: {
        status: 'supported',
        confidence: 0.91,
        supportingSourceIds: ['src-002', 'src-004', 'src-005'],
        contradictingSourceIds: [],
        notes: 'Dates and approval milestones are corroborated by 3 independent sources.',
      },
    },
    {
      id: 'seg-003',
      order: 3,
      heading: 'CRISPR in Cancer Treatment: How It Works Clinically',
      narration:
        "In oncology, CRISPR is being deployed in two main ways. First, ex vivo editing — taking a patient's T-cells, editing them outside the body to better recognize cancer antigens, then reinfusing them. This approach, used in CAR-T cell therapies, is showing remarkable results in leukemia and lymphoma. Second, in vivo editing — delivering CRISPR directly into the body to silence oncogenes or restore tumor suppressor genes. This is harder but potentially transformative for solid tumors like pancreatic cancer, which historically has a five-year survival rate below 12%. Early trials are reporting stable disease in previously untreatable patients.",
      bRollCues: [
        'Animation of T-cell engineering process',
        'Infusion room footage — patient receiving cell therapy',
        'Microscope imagery of cancer cells being targeted',
        'Graph showing CAR-T response rates vs traditional chemo',
      ],
      sourceIds: ['src-003', 'src-005', 'src-006'],
      durationS: 340,
      verification: {
        status: 'single-source',
        confidence: 0.62,
        supportingSourceIds: ['src-005'],
        contradictingSourceIds: [],
        notes:
          "The '70%+ response rate' claim is sourced only from cancer.gov; recommend a second oncology source.",
      },
    },
    {
      id: 'seg-004',
      order: 4,
      heading: 'Ethical Frameworks: The Lines We Must Not Cross',
      narration:
        "The power of CRISPR forces urgent ethical questions. Somatic editing — changing genes in a living adult — is broadly accepted when it treats disease. Germline editing — altering embryos in ways that pass to future generations — is where consensus breaks down. In 2018, He Jiankui shocked the world by announcing the birth of gene-edited twin girls. The scientific community's response was swift condemnation. He was sentenced to three years in prison. The incident accelerated calls for international governance frameworks. The WHO's Expert Advisory Committee released recommendations in 2021 calling for a global registry of all germline editing research and mandatory pre-approval before any clinical application.",
      bRollCues: [
        'Footage of He Jiankui news coverage',
        'WHO headquarters Geneva exterior shot',
        'Graphic showing somatic vs germline editing distinction',
        'Panel discussion footage at bioethics conference',
      ],
      sourceIds: ['src-006', 'src-007'],
      durationS: 330,
      verification: {
        status: 'supported',
        confidence: 0.88,
        supportingSourceIds: ['src-006', 'src-007'],
        contradictingSourceIds: [],
        notes: 'WHO and BMJ both confirm the 2018 Jiankui sentencing and the 2021 framework.',
      },
    },
    {
      id: 'seg-005',
      order: 5,
      heading: 'Access, Equity, and the $2 Million Problem',
      narration:
        "Casgevy, the approved CRISPR therapy, is priced at 2.2 million dollars per treatment. For context, the diseases it treats — sickle cell and beta-thalassemia — disproportionately affect populations in sub-Saharan Africa, the Middle East, and South Asia, where healthcare systems cannot absorb costs anywhere near that figure. This creates a profound equity gap: the people who stand to benefit most from CRISPR's cancer-fighting potential are the least likely to access it. Researchers and advocacy groups are pushing for tiered pricing models, compulsory licensing in low-income countries, and public funding mandates for publicly-funded research outputs.",
      bRollCues: [
        'Map showing global distribution of sickle cell disease',
        'Hospital in West Africa — contrasting with US treatment center',
        'Graphic showing $2.2M price tag vs median income comparisons',
        'Protest footage — healthcare access advocates',
      ],
      sourceIds: ['src-004', 'src-007', 'src-008'],
      durationS: 295,
      verification: {
        status: 'contradicted',
        confidence: 0.45,
        supportingSourceIds: ['src-004'],
        contradictingSourceIds: ['src-008'],
        notes:
          'STAT cites $2.2M; the Lancet review cites a manufacturer list price closer to $2.0M-$2.4M depending on region. Resolve before publishing.',
      },
    },
    {
      id: 'seg-006',
      order: 6,
      heading: 'What Comes Next: The 5-Year Horizon',
      narration:
        'The next five years will be defined by three developments. First, base editing and prime editing — newer CRISPR variants that make single-letter DNA changes without cutting both strands, dramatically reducing off-target effects. Second, in vivo delivery improvements — lipid nanoparticles and viral vectors are becoming more precise at targeting specific organs. Third, AI-assisted guide RNA design — machine learning models are now predicting the most effective and safest editing sequences orders of magnitude faster than manual design. The convergence of these three trends means we may see CRISPR therapies for solid tumors — the hardest cancers to treat — entering Phase 3 trials by 2027.',
      bRollCues: [
        'Animation of base editing mechanism',
        'Lipid nanoparticle delivery animation',
        'AI model interface showing guide RNA prediction',
        'Clinical trial facility exterior — forward-looking b-roll',
      ],
      sourceIds: ['src-001', 'src-005', 'src-008'],
      durationS: 310,
      verification: {
        status: 'single-source',
        confidence: 0.55,
        supportingSourceIds: ['src-008'],
        contradictingSourceIds: [],
        notes:
          'Forward-looking 5-year horizon claims rely heavily on a single Lancet review; mark as speculative on screen.',
      },
    },
  ],
  outro:
    'CRISPR is not a silver bullet — it is a platform. A set of molecular tools that are improving rapidly, being applied carefully, and generating results that would have been called impossible a decade ago. The ethical and equity challenges are real and urgent. But the trajectory is clear: gene editing is moving from experimental to essential. For video creators, researchers, and anyone tracking the future of medicine, this is the story of our generation. Subscribe for more deep dives into the science reshaping the world.',
  outroSourceIds: ['src-002', 'src-008'],
  outroVerification: {
    status: 'supported',
    confidence: 0.82,
    supportingSourceIds: ['src-002', 'src-008'],
    contradictingSourceIds: [],
    notes:
      'CTA is editorial; supporting sources back the underlying claim that the field is accelerating.',
  },
  hookVerification: {
    status: 'supported',
    confidence: 0.86,
    supportingSourceIds: ['src-001', 'src-002'],
    contradictingSourceIds: [],
    notes:
      'Both opening claims are anchored to Nature and the Doudna-Charpentier foundational paper.',
  },
  wordCount: 2840,
  estimatedDurationS: 1870,
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/**
 * Snapshot the writer-node output verbatim. Anything the user types after
 * mount is compared against this map to detect rewrites that may have
 * drifted from the captured sources.
 */
function buildBaseline(s: ScriptData): Record<string, string> {
  const out: Record<string, string> = {
    hook: s.hook,
    outro: s.outro,
  };
  for (const seg of s.segments) out[seg.id] = seg.narration;
  return out;
}

interface Props {
  highlightedSourceId: string | null;
  onCitationClick: (sourceId: string) => void;
  onBRollDataReady?: (items: BRollExportItem[]) => void;
  onExportGoogleDocs?: () => void;
}

export interface BRollExportItem {
  id: string;
  segmentTitle: string;
  segmentOrder: number;
  cue: string;
  checked: boolean;
}

/**
 * Region keys used by the citation-integrity tracker. The hook + outro live
 * outside the segments array so we use stable string keys for them; segments
 * are keyed by their id.
 */
type RegionKey = 'hook' | 'outro' | string;

export default function ScriptViewer({
  highlightedSourceId,
  onCitationClick,
  onBRollDataReady,
  onExportGoogleDocs,
}: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [scriptData, setScriptData] = useState<ScriptData>(MOCK_SCRIPT);
  const [hookVariantsOpen, setHookVariantsOpen] = useState(false);
  // Snapshot of the original text so we can detect post-LLM rewrites and
  // surface them as "uncited until re-anchored" — see Feature 2 spec.
  const [baselineText] = useState(() => buildBaseline(MOCK_SCRIPT));
  const [reanchored, setReanchored] = useState<Set<RegionKey>>(new Set());

  /** True iff the region has been edited since baseline AND not re-anchored. */
  function isUncited(key: RegionKey, currentText: string): boolean {
    if (reanchored.has(key)) return false;
    const baseline = baselineText[key];
    if (baseline === undefined) return false;
    return baseline.trim() !== currentText.trim();
  }

  function reanchor(key: RegionKey) {
    setReanchored((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  // Notify parent of B-roll data
  React.useEffect(() => {
    if (onBRollDataReady) {
      const items: BRollExportItem[] = scriptData.segments.flatMap((seg) =>
        seg.bRollCues.map((cue, i) => ({
          id: `broll-${seg.id}-${i}`,
          segmentTitle: seg.heading,
          segmentOrder: seg.order,
          cue,
          checked: false,
        }))
      );
      onBRollDataReady(items);
    }
  }, [scriptData, onBRollDataReady]);

  /** Aggregate verification counts shown in the header legend. */
  const verificationCounts = useMemo<Record<VerificationStatus, number>>(() => {
    const counts: Record<VerificationStatus, number> = {
      supported: 0,
      'single-source': 0,
      contradicted: 0,
      unverified: 0,
    };
    counts[scriptData.hookVerification.status] += 1;
    counts[scriptData.outroVerification.status] += 1;
    for (const seg of scriptData.segments) counts[seg.verification.status] += 1;
    return counts;
  }, [scriptData]);

  function clearReanchor(key: RegionKey) {
    setReanchored((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  function updateHook(newHook: string) {
    clearReanchor('hook');
    setScriptData((prev) => ({ ...prev, hook: newHook }));
  }

  function updateOutro(newOutro: string) {
    clearReanchor('outro');
    setScriptData((prev) => ({ ...prev, outro: newOutro }));
  }

  function updateSegmentNarration(segId: string, newNarration: string) {
    clearReanchor(segId);
    setScriptData((prev) => ({
      ...prev,
      segments: prev.segments.map((s) => (s.id === segId ? { ...s, narration: newNarration } : s)),
    }));
  }

  function updateSegmentHeading(segId: string, newHeading: string) {
    setScriptData((prev) => ({
      ...prev,
      segments: prev.segments.map((s) => (s.id === segId ? { ...s, heading: newHeading } : s)),
    }));
  }

  function applyHookVariant(variant: HookVariant) {
    // The variant is LLM-generated against the same source manifest as the
    // canonical script, so it ships pre-anchored — re-anchor immediately to
    // suppress the "Uncited rewrite" warning that would otherwise fire when
    // the new text differs from the writer-node baseline.
    reanchor('hook');
    setScriptData((prev) => {
      const variantHasSources = variant.sourceIds.length > 0;
      const status =
        variant.sourceIds.length >= 2
          ? 'supported'
          : variant.sourceIds.length === 1
            ? 'single-source'
            : 'unverified';
      const confidence =
        variant.sourceIds.length >= 2 ? 0.85 : variant.sourceIds.length === 1 ? 0.6 : 0;
      return {
        ...prev,
        hook: variant.text,
        hookSourceIds: variantHasSources ? variant.sourceIds : prev.hookSourceIds,
        hookVerification: {
          status,
          confidence,
          // Keep verification metadata in sync with the displayed citation
          // badges: when the variant has no sources we fall back to the
          // previous citations rather than orphaning the badges.
          supportingSourceIds: variantHasSources
            ? variant.sourceIds
            : prev.hookVerification.supportingSourceIds,
          contradictingSourceIds: [],
          notes: `Applied ${variant.angle} hook variant — verify framing matches source intent.`,
        },
      };
    });
  }

  function handleExport(format: 'txt' | 'md' | 'json') {
    setExportOpen(false);
    const content =
      format === 'json'
        ? JSON.stringify(scriptData, null, 2)
        : format === 'md'
          ? `# ${scriptData.title}\n\n${scriptData.hook}\n\n${scriptData.segments.map((s) => `## ${s.heading}\n\n${s.narration}`).join('\n\n')}\n\n${scriptData.outro}`
          : `${scriptData.title}\n\n${scriptData.hook}\n\n${scriptData.segments.map((s) => `${s.heading}\n\n${s.narration}`).join('\n\n')}\n\n${scriptData.outro}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-job-1c93be.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="py-6 space-y-7 max-w-[848px]">
      {/* Script Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="section-label">Video Script</span>
            <span className="flex items-center gap-1 text-2xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <HugeiconsIcon icon={PencilEdit01Icon} size={10} strokeWidth={2.25} />
              Editable
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground leading-tight">{scriptData.title}</h2>
          <div className="flex items-center gap-3 text-xs text-foreground font-semibold">
            <span className="font-mono tabular-nums">
              {scriptData.wordCount.toLocaleString()} words
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="">{formatDuration(scriptData.estimatedDurationS)} est.</span>
            <span className="text-muted-foreground">&bull;</span>
            <span>{scriptData.segments.length} segments</span>
          </div>
          <div className="pt-2">
            <VerificationLegend counts={verificationCounts} />
          </div>
        </div>

        {/* Export Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Google Docs Export */}
          {onExportGoogleDocs && (
            <button
              onClick={onExportGoogleDocs}
              className="btn-secondary gap-1.5 text-xs py-1.5 px-3"
              title="Export to Google Docs"
            >
              <svg viewBox="0 0 24 24" width="13" height="13">
                <path
                  fill="#4285F4"
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                />
                <path fill="#fff" d="M14 2v6h6" />
                <path
                  fill="#fff"
                  d="M8 13h8M8 17h5"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Docs
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="btn-secondary gap-1.5 text-xs py-1.5 px-3"
            >
              <HugeiconsIcon icon={Download01Icon} size={13} />
              Export
              <HugeiconsIcon icon={ArrowDown01Icon}
                size={12}
                className={`transition-transform duration-150 ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in">
                {[
                  {
                    key: 'export-txt',
                    label: 'Plain Text',
                    fmt: 'txt' as const,
                    icon: <HugeiconsIcon icon={File02Icon} size={13} />,
                  },
                  {
                    key: 'export-md',
                    label: 'Markdown',
                    fmt: 'md' as const,
                    icon: <HugeiconsIcon icon={HashtagIcon} size={13} />,
                  },
                  {
                    key: 'export-json',
                    label: 'JSON',
                    fmt: 'json' as const,
                    icon: <HugeiconsIcon icon={CodeIcon} size={13} />,
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleExport(opt.fmt)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-muted-foreground">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hook Block */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="section-label">Hook</span>
            <span className="text-2xs font-mono text-muted-foreground">0–30s</span>
            <VerificationBadge verification={scriptData.hookVerification} size="sm" />
          </div>
          <button
            onClick={() => setHookVariantsOpen(true)}
            className="btn-secondary gap-1.5 text-2xs py-1 px-2.5"
            title="Generate alternative hooks"
          >
            <HugeiconsIcon icon={SparklesIcon} size={11} />
            Hook variants
          </button>
        </div>
        <div
          className={`
            border rounded-xl p-5 space-y-3 transition-colors
            ${
              isUncited('hook', scriptData.hook)
                ? 'bg-amber-50/40 border-amber-300'
                : 'bg-primary/5 border-primary/20'
            }
          `}
        >
          <ScriptEditor
            value={scriptData.hook}
            onSave={updateHook}
            className="text-sm font-medium italic"
            label="Hook"
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {scriptData.hookSourceIds.map((sid) => (
                <CitationBadge
                  key={`hook-cite-${sid}`}
                  sourceId={sid}
                  isHighlighted={highlightedSourceId === sid}
                  onClick={() => onCitationClick(sid)}
                />
              ))}
            </div>
            {isUncited('hook', scriptData.hook) && (
              <UncitedWarning onReanchor={() => reanchor('hook')} />
            )}
          </div>
        </div>
      </div>

      {/* Script Segments */}
      <div className="space-y-6">
        <span className="section-label">Script Segments</span>
        {scriptData.segments.map((seg) => (
          <ScriptSegmentBlock
            key={seg.id}
            segment={seg}
            highlightedSourceId={highlightedSourceId}
            onCitationClick={onCitationClick}
            onUpdateNarration={(val) => updateSegmentNarration(seg.id, val)}
            onUpdateHeading={(val) => updateSegmentHeading(seg.id, val)}
            isUncited={isUncited(seg.id, seg.narration)}
            onReanchor={() => reanchor(seg.id)}
          />
        ))}
      </div>

      {/* Outro */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="section-label">Outro / Call to Action</span>
          <VerificationBadge verification={scriptData.outroVerification} size="sm" />
        </div>
        <div
          className={`
            border rounded-xl p-5 space-y-3 transition-colors
            ${
              isUncited('outro', scriptData.outro)
                ? 'bg-amber-50/40 border-amber-300'
                : 'bg-secondary/20 border-secondary/40'
            }
          `}
        >
          <ScriptEditor
            value={scriptData.outro}
            onSave={updateOutro}
            className="text-sm"
            label="Outro"
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {scriptData.outroSourceIds.map((sid) => (
                <CitationBadge
                  key={`outro-cite-${sid}`}
                  sourceId={sid}
                  isHighlighted={highlightedSourceId === sid}
                  onClick={() => onCitationClick(sid)}
                />
              ))}
            </div>
            {isUncited('outro', scriptData.outro) && (
              <UncitedWarning onReanchor={() => reanchor('outro')} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-12" />

      <HookVariantsModal
        open={hookVariantsOpen}
        jobId="job-1c93be"
        currentHook={scriptData.hook}
        onClose={() => setHookVariantsOpen(false)}
        onApply={applyHookVariant}
      />
    </div>
  );
}

/**
 * Inline warning shown next to a region whose text has drifted from the
 * source-anchored baseline. The user can re-anchor to clear the warning
 * once they've manually verified the rewrite still matches their sources.
 */
function UncitedWarning({ onReanchor }: { onReanchor: () => void }) {
  return (
    <div className="flex items-center gap-2 text-2xs">
      <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
        <HugeiconsIcon icon={Alert01Icon} size={11} />
        Uncited rewrite
      </span>
      <button
        type="button"
        onClick={onReanchor}
        className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
        title="Mark this section as re-verified against its sources"
      >
        <HugeiconsIcon icon={RotateLeft01Icon} size={10} />
        Re-anchor to sources
      </button>
    </div>
  );
}

function CitationBadge({
  sourceId,
  isHighlighted,
  onClick,
}: {
  sourceId: string;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const num = sourceId.replace('src-', '');
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center w-5 h-5 rounded-full text-2xs font-bold
        transition-all duration-150 active:scale-95
        ${
          isHighlighted
            ? 'bg-primary text-primary-foreground ring-2 ring-primary/40'
            : 'bg-secondary/60 text-foreground hover:bg-primary hover:text-primary-foreground'
        }
      `}
      aria-label={`Source ${num}`}
      title={`Jump to source ${num}`}
    >
      {num}
    </button>
  );
}

function ScriptSegmentBlock({
  segment,
  highlightedSourceId,
  onCitationClick,
  onUpdateNarration,
  onUpdateHeading,
  isUncited,
  onReanchor,
}: {
  segment: ScriptSegment;
  highlightedSourceId: string | null;
  onCitationClick: (id: string) => void;
  onUpdateNarration: (val: string) => void;
  onUpdateHeading: (val: string) => void;
  isUncited: boolean;
  onReanchor: () => void;
}) {
  return (
    <div
      className={`
        card p-5 space-y-4 animate-fade-in
        ${isUncited ? 'border-amber-300 bg-amber-50/30' : ''}
      `}
    >
      {/* Segment Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-2xs font-bold flex items-center justify-center shrink-0">
            {segment.order}
          </span>
          <div className="flex-1 min-w-0">
            <ScriptEditor
              value={segment.heading}
              onSave={onUpdateHeading}
              className="text-sm font-bold"
              label="Section Title"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <VerificationBadge verification={segment.verification} size="sm" />
          <span className="font-mono text-2xs text-muted-foreground whitespace-nowrap">
            {formatDuration(segment.durationS)}
          </span>
        </div>
      </div>

      {/* Narration */}
      <ScriptEditor
        value={segment.narration}
        onSave={onUpdateNarration}
        className="text-sm"
        label="Narration"
      />

      {/* Verification rationale */}
      {segment.verification.notes && (
        <p className="text-2xs text-muted-foreground italic leading-relaxed border-l-2 border-border pl-3">
          {segment.verification.notes}
        </p>
      )}

      {/* B-Roll Cues */}
      {segment.bRollCues.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
            B-Roll Cues
          </span>
          <div className="flex flex-wrap gap-1.5">
            {segment.bRollCues.map((cue, ci) => (
              <span
                key={`cue-${segment.id}-${ci}`}
                className="text-2xs px-2.5 py-1 rounded-full bg-secondary/30 border border-secondary/50 text-foreground font-medium"
              >
                🎬 {cue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Citations */}
      {segment.sourceIds.length > 0 && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-semibold text-muted-foreground">Sources:</span>
            <div className="flex items-center gap-1.5">
              {segment.sourceIds.map((sid) => (
                <CitationBadge
                  key={`seg-cite-${segment.id}-${sid}`}
                  sourceId={sid}
                  isHighlighted={highlightedSourceId === sid}
                  onClick={() => onCitationClick(sid)}
                />
              ))}
            </div>
          </div>
          {isUncited && (
            <div className="flex items-center gap-2 text-2xs">
              <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                <HugeiconsIcon icon={Alert01Icon} size={11} />
                Uncited rewrite
              </span>
              <button
                type="button"
                onClick={onReanchor}
                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                title="Mark this section as re-verified against its sources"
              >
                <HugeiconsIcon icon={RotateLeft01Icon} size={10} />
                Re-anchor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
