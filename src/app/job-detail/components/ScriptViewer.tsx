'use client';

import React, { useState, useEffect } from 'react';
import { Download, ChevronDown, FileText, Code, Hash, Edit3 } from 'lucide-react';
import ScriptEditor from './ScriptEditor';

interface ScriptSegment {
  id: string;
  order: number;
  heading: string;
  narration: string;
  bRollCues: string[];
  sourceIds: string[];
  durationS: number;
}

interface ScriptData {
  title: string;
  hook: string;
  hookSourceIds: string[];
  segments: ScriptSegment[];
  outro: string;
  outroSourceIds: string[];
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
    },
  ],
  outro:
    'CRISPR is not a silver bullet — it is a platform. A set of molecular tools that are improving rapidly, being applied carefully, and generating results that would have been called impossible a decade ago. The ethical and equity challenges are real and urgent. But the trajectory is clear: gene editing is moving from experimental to essential. For video creators, researchers, and anyone tracking the future of medicine, this is the story of our generation. Subscribe for more deep dives into the science reshaping the world.',
  outroSourceIds: ['src-002', 'src-008'],
  wordCount: 2840,
  estimatedDurationS: 1870,
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
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

export default function ScriptViewer({
  highlightedSourceId,
  onCitationClick,
  onBRollDataReady,
  onExportGoogleDocs,
}: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [scriptData, setScriptData] = useState<ScriptData>(MOCK_SCRIPT);

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
  }, [scriptData]);

  function updateHook(newHook: string) {
    setScriptData((prev) => ({ ...prev, hook: newHook }));
  }

  function updateOutro(newOutro: string) {
    setScriptData((prev) => ({ ...prev, outro: newOutro }));
  }

  function updateSegmentNarration(segId: string, newNarration: string) {
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
              <Edit3 size={10} strokeWidth={2.25} />
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
              <Download size={13} />
              Export
              <ChevronDown
                size={12}
                className={`transition-transform duration-150 ${exportOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in">
                {[
                  {
                    key: 'export-txt',
                    label: 'Plain Text',
                    fmt: 'txt' as const,
                    icon: <FileText size={13} />,
                  },
                  {
                    key: 'export-md',
                    label: 'Markdown',
                    fmt: 'md' as const,
                    icon: <Hash size={13} />,
                  },
                  {
                    key: 'export-json',
                    label: 'JSON',
                    fmt: 'json' as const,
                    icon: <Code size={13} />,
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
        <div className="flex items-center gap-2">
          <span className="section-label">Hook</span>
          <span className="text-2xs font-mono text-muted-foreground">0–30s</span>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
          <ScriptEditor
            value={scriptData.hook}
            onSave={updateHook}
            className="text-sm font-medium italic"
            label="Hook"
          />
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
          />
        ))}
      </div>

      {/* Outro */}
      <div className="space-y-2">
        <span className="section-label">Outro / Call to Action</span>
        <div className="bg-secondary/20 border border-secondary/40 rounded-xl p-5 space-y-3">
          <ScriptEditor
            value={scriptData.outro}
            onSave={updateOutro}
            className="text-sm"
            label="Outro"
          />
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
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-12" />
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
}: {
  segment: ScriptSegment;
  highlightedSourceId: string | null;
  onCitationClick: (id: string) => void;
  onUpdateNarration: (val: string) => void;
  onUpdateHeading: (val: string) => void;
}) {
  return (
    <div className="card p-5 space-y-4 animate-fade-in">
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
        <span className="font-mono text-2xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
          {formatDuration(segment.durationS)}
        </span>
      </div>

      {/* Narration */}
      <ScriptEditor
        value={segment.narration}
        onSave={onUpdateNarration}
        className="text-sm"
        label="Narration"
      />

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
        <div className="flex items-center gap-2 pt-1 border-t border-border">
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
      )}
    </div>
  );
}
