'use client';

import React, { useState } from 'react';
import ScriptViewer from './ScriptViewer';
import SourcePanel from './SourcePanel';

export default function DualPaneView() {
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Left Pane — Script Viewer */}
      <div className="flex-1 overflow-y-auto scrollbar-thin border-r border-border min-w-0">
        <ScriptViewer
          highlightedSourceId={highlightedSourceId}
          onCitationClick={setHighlightedSourceId}
        />
      </div>

      {/* Right Pane — Source Panel */}
      <div className="w-[380px] xl:w-[420px] 2xl:w-[460px] shrink-0 overflow-y-auto scrollbar-thin">
        <SourcePanel
          highlightedSourceId={highlightedSourceId}
          onSourceClick={setHighlightedSourceId}
        />
      </div>
    </div>
  );
}