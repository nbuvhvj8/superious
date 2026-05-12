'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Image from 'next/image';
import GoogleDriveBackupModal from './components/GoogleDriveBackupModal';
import {
  Database,
  FolderOpen,
  Cloud,
  Network,
  Image as ImageIcon,
  ExternalLink,
  Plus,
  Search,
  Tag,
  Link as LinkIcon,
  ChevronRight,
  HardDrive,
} from 'lucide-react';

type TabType = 'assets' | 'cloud' | 'knowledge';

export default function StoragesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('assets');
  const [showBackupModal, setShowBackupModal] = useState(false);

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Database size={20} />
            </div>
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              Storage & Assets
            </span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Storages</h1>
              <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                Manage your research assets, cloud integrations, and semantic knowledge base.
              </p>
            </div>
            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <HardDrive size={18} />
              Backup to Drive
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'assets'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen size={16} />
              Asset Explorer
            </div>
            {activeTab === 'assets' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'cloud' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Cloud size={16} />
              Cloud Sync
            </div>
            {activeTab === 'cloud' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'knowledge'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Network size={16} />
              Knowledge Base
            </div>
            {activeTab === 'knowledge' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'assets' && <AssetExplorer />}
          {activeTab === 'cloud' && <CloudSync onOpenBackup={() => setShowBackupModal(true)} />}
          {activeTab === 'knowledge' && <KnowledgeBase />}
        </div>
      </div>

      <GoogleDriveBackupModal open={showBackupModal} onClose={() => setShowBackupModal(false)} />
    </AppLayout>
  );
}

function AssetExplorer() {
  const [topic, setTopic] = useState('');
  const [assets, setAssets] = useState<
    Array<{
      id: string;
      title: string;
      type: string;
      sourceDomain: string;
      jobId: string;
      captureDate: string;
      confidence: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  async function loadAssets() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (topic) qs.set('topic', topic);
      const res = await fetch(`/api/v1/assets?${qs.toString()}`);
      const data = (await res.json()) as { assets: typeof assets };
      setAssets(data.assets ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function seedAndLoad() {
    await fetch('/api/v1/assets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        assets: [
          {
            type: 'screenshot',
            sourceUrl: 'https://www.theverge.com/sample',
            sourceDomain: 'theverge.com',
            captureDate: new Date().toISOString(),
            topicTags: ['streaming'],
            claimTags: ['ad-tier'],
            sourceType: 'news',
            confidence: 0.86,
            jobId: 'job-1c93be',
            runId: 'recap-seed',
            title: 'Ad-tier growth chart',
          },
        ],
      }),
    });
    await loadAssets();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Asset & B-Roll Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              placeholder="Filter by topic tag (e.g. streaming)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-muted/50 border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none w-64"
            />
          </div>
          <button className="btn btn-secondary text-xs px-3 py-1.5" onClick={loadAssets}>
            Search
          </button>
          <button className="btn btn-primary text-xs px-3 py-1.5" onClick={seedAndLoad}>
            Add sample
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        A file-explorer style view that organizes all captured screenshots, exported PDFs, and
        generated script versions.
      </p>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <div className="flex-1">Name</div>
          <div className="w-32">Type</div>
          <div className="w-32">Job ID</div>
          <div className="w-32 text-right">Date Added</div>
        </div>
        <div className="divide-y divide-border">
          {loading && <div className="px-4 py-3 text-sm text-muted-foreground">Loading…</div>}
          {!loading && assets.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No assets yet. Click <strong>Add sample</strong> or ingest via API.
            </div>
          )}
          {assets.map((asset) => (
            <AssetRow
              key={asset.id}
              id={asset.id}
              name={asset.title}
              type={asset.type}
              jobId={asset.jobId}
              date={new Date(asset.captureDate).toLocaleDateString()}
              icon={<ImageIcon size={18} className="text-emerald-500" />}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetRow({
  id,
  name,
  type,
  jobId,
  date,
  icon,
}: {
  id: string;
  name: string;
  type: string;
  jobId: string;
  date: string;
  icon: React.ReactNode;
}) {
  const [citation, setCitation] = useState<string | null>(null);

  async function onCite() {
    const res = await fetch(`/api/v1/assets/${id}/cite`, { method: 'POST' });
    const data = (await res.json()) as { citation?: string };
    setCitation(data.citation ?? null);
  }

  return (
    <div className="flex items-center px-4 py-3 hover:bg-muted/50 transition-colors group">
      <div className="flex-1 flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {name}
        </span>
      </div>
      <div className="w-32 text-sm text-muted-foreground">{type}</div>
      <div className="w-32 text-sm font-mono text-muted-foreground">{jobId}</div>
      <div className="w-32 text-sm text-muted-foreground text-right">{date}</div>
      <button className="ml-4 text-xs text-primary font-semibold" onClick={onCite}>
        Cite in script
      </button>
      {citation && (
        <div className="ml-3 text-2xs text-muted-foreground max-w-xs truncate">{citation}</div>
      )}
    </div>
  );
}

function CloudSync({ onOpenBackup }: { onOpenBackup?: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Multi-Platform Export Sync</h2>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Map your research collections to specific folders in Google Drive, Notion, or Dropbox.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CloudCard
          name="Google Drive"
          icon="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
          connected={true}
          folder="/Outlier/Research/2024"
          onOpenBackup={onOpenBackup}
        />
        <CloudCard
          name="Notion"
          icon="https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg"
          connected={true}
          folder="Research Database"
        />
        <CloudCard
          name="Dropbox"
          icon="https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg"
          connected={false}
        />
        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Plus size={24} />
          </div>
          <h3 className="font-bold mb-1">Add New Integration</h3>
          <p className="text-sm text-muted-foreground">Sync your data to more platforms</p>
        </div>
      </div>
    </div>
  );
}

function CloudCard({
  name,
  icon,
  connected,
  folder,
  onOpenBackup,
}: {
  name: string;
  icon: string;
  connected: boolean;
  folder?: string;
  onOpenBackup?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 p-2 bg-white rounded-lg border border-border shadow-sm flex items-center justify-center overflow-hidden relative">
            <Image
              src={icon}
              alt={name}
              fill
              className="object-contain p-2"
              unoptimized={icon.endsWith('.svg')}
            />
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-tight">{name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-muted-foreground'}`}
              />
              <span className="text-xs text-muted-foreground">
                {connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {name === 'Google Drive' && connected && (
            <button
              onClick={onOpenBackup}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
            >
              Backup Now
            </button>
          )}
          <button
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${connected ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-primary text-primary-foreground'}`}
          >
            {connected ? 'Settings' : 'Connect'}
          </button>
        </div>
      </div>

      {connected && (
        <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between border border-border/50">
          <div className="flex items-center gap-2">
            <FolderOpen size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-[200px]">{folder}</span>
          </div>
          <ExternalLink
            size={14}
            className="text-muted-foreground hover:text-primary cursor-pointer transition-colors"
          />
        </div>
      )}
    </div>
  );
}

function KnowledgeBase() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Semantic Knowledge Base</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20">
          <Network size={16} />
          Graph View
        </button>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Cross-reference sources across multiple jobs using semantic tags and AI-driven linking.
      </p>

      <div className="grid gap-4">
        <KnowledgeSource
          title="The Economics of Streaming Services"
          tags={['Business', 'Streaming', 'Revenue']}
          jobs={['JOB-001', 'JOB-015']}
          relevance={98}
        />
        <KnowledgeSource
          title="AI Trends in Content Creation 2025"
          tags={['AI', 'Future Tech', 'Production']}
          jobs={['JOB-042']}
          relevance={92}
        />
        <KnowledgeSource
          title="Social Media Algorithm Changes"
          tags={['Social Media', 'Marketing']}
          jobs={['JOB-012', 'JOB-001', 'JOB-088']}
          relevance={85}
        />
      </div>
    </div>
  );
}

function KnowledgeSource({
  title,
  tags,
  jobs,
  relevance,
}: {
  title: string;
  tags: string[];
  jobs: string[];
  relevance: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-md text-[10px] font-bold text-muted-foreground uppercase"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Relevance
          </div>
          <div className="text-lg font-black text-primary">{relevance}%</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <LinkIcon size={14} />
            Linked in {jobs.length} jobs
          </div>
          <div className="flex -space-x-2">
            {jobs.map((job) => (
              <div
                key={job}
                className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold"
                title={job}
              >
                {job.split('-')[1]}
              </div>
            ))}
          </div>
        </div>
        <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
          View Connections
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
