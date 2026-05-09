'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Search,
  Globe,
  Camera,
  PenLine,
  CheckCircle2,
  Loader2,
  ChevronRight,
  X,
  Sparkles,
  Database,
  Wrench,
  Clock,
} from 'lucide-react';

export type ActivityStepType =
  | 'thinking'
  | 'tool_call'
  | 'research'
  | 'web_search'
  | 'data_gathering'
  | 'screenshot'
  | 'writing'
  | 'source_ranking'
  | 'complete';

export interface ActivityStep {
  id: string;
  type: ActivityStepType;
  label: string;
  detail: string;
  status: 'running' | 'done' | 'pending';
  timestamp: string;
  substeps?: { text: string; done: boolean }[];
}

const STEP_ICONS: Record<ActivityStepType, React.ReactNode> = {
  thinking: <Brain size={14} />,
  tool_call: <Wrench size={14} />,
  research: <Search size={14} />,
  web_search: <Globe size={14} />,
  data_gathering: <Database size={14} />,
  screenshot: <Camera size={14} />,
  writing: <PenLine size={14} />,
  source_ranking: <Sparkles size={14} />,
  complete: <CheckCircle2 size={14} />,
};

const STEP_COLORS: Record<ActivityStepType, string> = {
  thinking: 'text-violet-500 bg-violet-50 border-violet-200',
  tool_call: 'text-orange-500 bg-orange-50 border-orange-200',
  research: 'text-blue-500 bg-blue-50 border-blue-200',
  web_search: 'text-cyan-500 bg-cyan-50 border-cyan-200',
  data_gathering: 'text-teal-500 bg-teal-50 border-teal-200',
  screenshot: 'text-pink-500 bg-pink-50 border-pink-200',
  writing: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  source_ranking: 'text-amber-500 bg-amber-50 border-amber-200',
  complete: 'text-green-500 bg-green-50 border-green-200',
};

const DEMO_STEPS: ActivityStep[] = [
  {
    id: 'step-1',
    type: 'thinking',
    label: 'Analyzing prompt',
    detail: 'Decomposing research question into focused search queries',
    status: 'done',
    timestamp: '0.0s',
    substeps: [
      { text: 'Parsing user intent: factual research with ethical angle', done: true },
      { text: 'Identifying key entities: CRISPR, cancer, ethics, gene editing', done: true },
      { text: 'Planning 4 search queries for comprehensive coverage', done: true },
    ],
  },
  {
    id: 'step-2',
    type: 'tool_call',
    label: 'query_planner',
    detail: 'Generated 4 search queries from prompt decomposition',
    status: 'done',
    timestamp: '1.2s',
    substeps: [
      { text: '"CRISPR cancer treatment clinical trials 2025"', done: true },
      { text: '"gene editing ethical framework regulations"', done: true },
      { text: '"CRISPR-Cas9 oncology breakthrough results"', done: true },
      { text: '"genome editing access equity cost"', done: true },
    ],
  },
  {
    id: 'step-3',
    type: 'web_search',
    label: 'Web search',
    detail: 'Executing 4 parallel searches via Tavily API',
    status: 'done',
    timestamp: '2.8s',
    substeps: [
      { text: 'Query 1: 12 results found', done: true },
      { text: 'Query 2: 9 results found', done: true },
      { text: 'Query 3: 11 results found', done: true },
      { text: 'Query 4: 8 results found', done: true },
    ],
  },
  {
    id: 'step-4',
    type: 'data_gathering',
    label: 'Deduplicating results',
    detail: 'Merging 40 raw results into 22 unique sources',
    status: 'done',
    timestamp: '4.1s',
  },
  {
    id: 'step-5',
    type: 'source_ranking',
    label: 'Ranking sources',
    detail: 'Scoring sources by relevance, recency, and authority',
    status: 'done',
    timestamp: '5.6s',
    substeps: [
      { text: 'nature.com — relevance 0.96, authority high', done: true },
      { text: 'nih.gov — relevance 0.94, authority high', done: true },
      { text: 'science.org — relevance 0.91, authority high', done: true },
      { text: 'Selected top 8 sources for script generation', done: true },
    ],
  },
  {
    id: 'step-6',
    type: 'screenshot',
    label: 'Capturing sources',
    detail: 'Taking screenshots of 8 source URLs via Playwright',
    status: 'done',
    timestamp: '12.3s',
    substeps: [
      { text: 'nature.com — captured (1440×2100)', done: true },
      { text: 'nih.gov — captured (1440×1800)', done: true },
      { text: 'science.org — captured (1440×2400)', done: true },
      { text: '5 more sources captured successfully', done: true },
    ],
  },
  {
    id: 'step-7',
    type: 'writing',
    label: 'Generating script',
    detail: 'Writing structured video script grounded in captured sources',
    status: 'done',
    timestamp: '18.7s',
    substeps: [
      { text: 'Hook: compelling 30s opening with data-led angle', done: true },
      { text: 'Generated 7 narration segments with B-roll cues', done: true },
      { text: 'Linked 24 source citations across segments', done: true },
      { text: 'Outro: call-to-action with forward-looking statement', done: true },
    ],
  },
  {
    id: 'step-8',
    type: 'complete',
    label: 'Research complete',
    detail: 'Script ready — 2,840 words, 8 sources, ~21min read time',
    status: 'done',
    timestamp: '22.4s',
  },
];

interface AgentActivityPanelProps {
  open: boolean;
  onClose: () => void;
  isActive?: boolean;
}

export default function AgentActivityPanel({
  open,
  onClose,
  isActive = false,
}: AgentActivityPanelProps) {
  const [steps, setSteps] = useState<ActivityStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setSteps([]);
      setExpandedSteps(new Set());
      return;
    }

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < DEMO_STEPS.length) {
        setSteps((prev) => {
          const next = [...prev];
          if (idx > 0 && next[idx - 1]) {
            next[idx - 1] = { ...next[idx - 1], status: 'done' };
          }
          const step = DEMO_STEPS[idx];
          next.push({
            ...step,
            status: idx === DEMO_STEPS.length - 1 ? 'done' : 'running',
          });
          return next;
        });
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-[420px] max-w-[90vw] bg-background border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Brain size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Agent Activity</h3>
              <p className="text-[10px] text-muted-foreground font-medium">
                {isActive ? 'Processing...' : `${steps.length} steps completed`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary">Live</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
              <Brain size={32} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-bold text-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start a research job to see the agent&apos;s thinking process here.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-border" />

              <div className="space-y-1">
                {steps.map((step, i) => {
                  const isExpanded = expandedSteps.has(step.id);
                  const colorClasses = STEP_COLORS[step.type];
                  const isLast = i === steps.length - 1;
                  const isRunning = step.status === 'running';

                  return (
                    <div key={step.id} className="relative pl-10 animate-fade-in">
                      {/* Timeline node */}
                      <div
                        className={`absolute left-0 top-2.5 w-[32px] h-[32px] rounded-full border-2 flex items-center justify-center z-10 ${colorClasses}`}
                      >
                        {isRunning ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          STEP_ICONS[step.type]
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-4 ${isLast ? '' : ''}`}>
                        <button
                          onClick={() => step.substeps && toggleExpand(step.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all duration-150 ${
                            isRunning
                              ? 'border-primary/30 bg-primary/5 shadow-sm'
                              : 'border-border bg-white hover:border-primary/20'
                          } ${step.substeps ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-foreground">
                                  {step.label}
                                </span>
                                {isRunning && (
                                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full animate-pulse">
                                    Running
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                {step.detail}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock size={9} />
                                <span className="font-mono">{step.timestamp}</span>
                              </div>
                              {step.substeps && (
                                <ChevronRight
                                  size={12}
                                  className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                />
                              )}
                            </div>
                          </div>

                          {/* Substeps (expandable) */}
                          {isExpanded && step.substeps && (
                            <div className="mt-2.5 pt-2.5 border-t border-border/60 space-y-1.5">
                              {step.substeps.map((sub, si) => (
                                <div key={si} className="flex items-start gap-2">
                                  {sub.done ? (
                                    <CheckCircle2
                                      size={11}
                                      className="text-green-500 shrink-0 mt-0.5"
                                    />
                                  ) : (
                                    <Loader2
                                      size={11}
                                      className="text-primary animate-spin shrink-0 mt-0.5"
                                    />
                                  )}
                                  <span className="text-[10px] text-muted-foreground leading-relaxed font-mono">
                                    {sub.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">
              {steps.filter((s) => s.status === 'done').length}/{DEMO_STEPS.length} steps
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {steps.length > 0 ? steps[steps.length - 1].timestamp : '—'}
            </span>
          </div>
          {steps.length > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${(steps.filter((s) => s.status === 'done').length / DEMO_STEPS.length) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
