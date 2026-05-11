'use client';

import React, { useState, useRef, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  FileText,
  Camera,
  Archive,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

type BackupStatus = 'idle' | 'selecting' | 'uploading' | 'success' | 'error' | 'not_connected';

interface BackupItem {
  id: string;
  name: string;
  type: 'script' | 'screenshots' | 'sources' | 'archive';
  size: string;
  jobId: string;
  date: string;
  selected: boolean;
}

const MOCK_BACKUP_ITEMS: BackupItem[] = [
  {
    id: 'bk-1',
    name: 'CRISPR Gene Editing Revolution — Script',
    type: 'script',
    size: '24 KB',
    jobId: 'JOB-042',
    date: '2h ago',
    selected: true,
  },
  {
    id: 'bk-2',
    name: 'CRISPR Gene Editing — Screenshots (8)',
    type: 'screenshots',
    size: '1.8 MB',
    jobId: 'JOB-042',
    date: '2h ago',
    selected: true,
  },
  {
    id: 'bk-3',
    name: 'CRISPR Gene Editing — Source Manifest',
    type: 'sources',
    size: '12 KB',
    jobId: 'JOB-042',
    date: '2h ago',
    selected: false,
  },
  {
    id: 'bk-4',
    name: 'Netflix Q4 Analysis — Full Archive',
    type: 'archive',
    size: '3.2 MB',
    jobId: 'JOB-041',
    date: '5h ago',
    selected: false,
  },
  {
    id: 'bk-5',
    name: 'Netflix Q4 Analysis — Script',
    type: 'script',
    size: '18 KB',
    jobId: 'JOB-041',
    date: '5h ago',
    selected: false,
  },
  {
    id: 'bk-6',
    name: 'SpaceX Starship Progress — Screenshots (7)',
    type: 'screenshots',
    size: '1.5 MB',
    jobId: 'JOB-040',
    date: 'Yesterday',
    selected: false,
  },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  script: <FileText size={14} className="text-blue-500" />,
  screenshots: <Camera size={14} className="text-pink-500" />,
  sources: <FolderOpen size={14} className="text-emerald-500" />,
  archive: <Archive size={14} className="text-amber-500" />,
};

interface GoogleDriveBackupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GoogleDriveBackupModal({ open, onClose }: GoogleDriveBackupModalProps) {
  const [status, setStatus] = useState<BackupStatus>('selecting');
  const [items, setItems] = useState<BackupItem[]>(MOCK_BACKUP_ITEMS);
  const [targetFolder, setTargetFolder] = useState('/Outlier/Backups/2025');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setStatus('selecting');
      setUploadProgress(0);
      setError('');
      setItems(MOCK_BACKUP_ITEMS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open]);

  const selectedCount = items.filter((i) => i.selected).length;
  const totalSize = items
    .filter((i) => i.selected)
    .reduce((acc, i) => {
      const num = parseFloat(i.size);
      const unit = i.size.includes('MB') ? 1024 : 1;
      return acc + num * unit;
    }, 0);

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));
  };

  const selectAll = () => {
    const allSelected = items.every((i) => i.selected);
    setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  };

  const handleUpload = () => {
    const accessToken =
      typeof window !== 'undefined' ? localStorage.getItem('google_access_token') : null;

    if (!accessToken) {
      setStatus('not_connected');
      return;
    }

    setStatus('uploading');
    setUploadProgress(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setStatus('success');
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 400);
  };

  const handleReset = () => {
    setStatus('selecting');
    setUploadProgress(0);
    setError('');
    setItems(MOCK_BACKUP_ITEMS);
  };

  return (
    <Modal open={open} onClose={onClose} title="Backup to Google Drive" size="lg">
      <div className="p-5 space-y-5">
        {/* Connection status */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
          <div className="w-8 h-8 p-1.5 bg-white rounded-lg border border-border shadow-sm flex items-center justify-center overflow-hidden relative">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
              alt="Google Drive"
              fill
              className="object-contain p-1.5"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-foreground">Google Drive</p>
            <p className="text-[10px] text-muted-foreground">Connected — sync to custom folder</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-green-600">Connected</span>
          </div>
        </div>

        {status === 'not_connected' && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] font-bold text-amber-700">Google Drive not connected</p>
              <p className="text-[10px] text-amber-600">
                Connect your Google account in Settings to enable backups.
              </p>
            </div>
            <a
              href="/settings"
              className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
            >
              Settings <ExternalLink size={10} />
            </a>
          </div>
        )}

        {status === 'selecting' && (
          <>
            {/* Target folder */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Target Folder
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white text-sm">
                  <FolderOpen size={14} className="text-muted-foreground shrink-0" />
                  <input
                    value={targetFolder}
                    onChange={(e) => setTargetFolder(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-[12px] font-medium text-foreground"
                    placeholder="/path/to/folder"
                  />
                </div>
              </div>
            </div>

            {/* Item selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Select Items to Backup
                </label>
                <button
                  onClick={selectAll}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  {items.every((i) => i.selected) ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-[240px] overflow-y-auto scrollbar-thin space-y-1 border border-border rounded-xl p-2 bg-white">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      item.selected
                        ? 'bg-primary/5 border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-[var(--primary)]"
                    />
                    <div className="shrink-0">{TYPE_ICONS[item.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {item.jobId}
                        </span>
                        <span className="text-[9px] text-muted-foreground">{item.date}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                      {item.size}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary & upload button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">{selectedCount}</span> items selected
                <span className="mx-1.5">·</span>
                <span className="font-bold text-foreground">
                  {totalSize >= 1024
                    ? `${(totalSize / 1024).toFixed(1)} MB`
                    : `${totalSize.toFixed(0)} KB`}
                </span>
              </div>
              <button
                onClick={handleUpload}
                disabled={selectedCount === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                  selectedCount === 0
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20'
                }`}
              >
                <Upload size={14} />
                Upload to Drive
              </button>
            </div>
          </>
        )}

        {status === 'uploading' && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 size={32} className="text-primary animate-spin" />
              <div>
                <p className="text-sm font-bold text-foreground">Uploading to Google Drive</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {selectedCount} items to {targetFolder}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center font-mono">
                {Math.min(Math.round(uploadProgress), 100)}%
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Backup Complete</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {selectedCount} items uploaded to {targetFolder}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
              >
                <ExternalLink size={12} />
                Open in Drive
              </a>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw size={12} />
                New Backup
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Backup Failed</p>
                <p className="text-[11px] text-red-600 mt-1">
                  {error || 'An unexpected error occurred.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
              >
                <RefreshCw size={12} />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
