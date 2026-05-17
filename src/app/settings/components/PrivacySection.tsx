

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Shield01Icon } from '@hugeicons/core-free-icons';
import Toggle from '@/components/ui/Toggle';

export default function PrivacySection() {
  const [usageData, setUsageData] = useState(true);
  const [cookies, setCookies] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  return (
    <section id="privacy" className="space-y-12">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-[#f2f3f6] flex items-center justify-center">
          <HugeiconsIcon icon={Shield01Icon} size={15} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Privacy</h2>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-start justify-between gap-8">
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-medium text-foreground">Usage Data Collection</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Help us improve outlier by sharing anonymous usage data. This includes feature usage
              and performance metrics.
            </p>
          </div>
          <Toggle checked={usageData} onChange={setUsageData} />
        </div>

        <div className="flex items-start justify-between gap-8">
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-medium text-foreground">Essential & Functional Cookies</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              We use cookies to maintain your session and remember your preferences. These are
              required for the app to function.
            </p>
          </div>
          <Toggle checked={cookies} onChange={setCookies} />
        </div>

        <div className="flex items-start justify-between gap-8">
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-medium text-foreground">Personalization</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Allow us to personalize your experience based on your research history and interests.
            </p>
          </div>
          <Toggle checked={personalization} onChange={setPersonalization} />
        </div>

        <div className="p-4 rounded-[12px] bg-[#f2f3f6]/50 border border-border/40 mt-8">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground uppercase text-[10px] tracking-wider block mb-1">
              Data Retention
            </span>
            Your personal data and research results are encrypted and stored securely. We do not
            sell your data to third parties. For more details, please review our full Privacy
            Policy.
          </p>
        </div>
      </div>
    </section>
  );
}
