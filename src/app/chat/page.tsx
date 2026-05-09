'use client';

import React, { useCallback, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ChatTopBar from './components/ChatTopBar';
import MessagesArea from './components/MessagesArea';
import ChatInput from './components/ChatInput';
import { Message } from './components/MessageRow';
import SlashCommandMenu, { type SlashCommand } from './components/SlashCommandMenu';
import AgentActivityPanel from './components/AgentActivityPanel';
import GoogleDriveBackupModal from './components/GoogleDriveBackupModal';

interface SearchHit {
  title: string;
  url: string;
  snippet: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  // Slash command state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');

  // Agent activity panel state
  const [showActivityPanel, setShowActivityPanel] = useState(false);

  // Google Drive backup modal state
  const [showGDriveModal, setShowGDriveModal] = useState(false);

  const updateMessage = useCallback((id: string, patch: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const fetchWebSearch = useCallback(async (query: string): Promise<SearchHit[]> => {
    try {
      const res = await fetch('/api/tools/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, maxResults: 6 }),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: SearchHit[] };
      return data.results ?? [];
    } catch {
      return [];
    }
  }, []);

  const handleSlashCommand = useCallback((command: SlashCommand) => {
    setShowSlashMenu(false);
    setInputValue('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: command.label,
      instant: true,
    };

    const aiMsg: Message = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      instant: true,
      commandType: command.action,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);

    if (command.action === 'gdrive_backup') {
      setShowGDriveModal(true);
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);

    if (value.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashQuery(value);
    } else {
      setShowSlashMenu(false);
      setSlashQuery('');
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isGenerating) return;

    if (text.startsWith('/')) {
      return;
    }

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      instant: true,
    };
    const aiId = `a-${Date.now() + 1}`;
    const aiPlaceholder: Message = {
      id: aiId,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    const history = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage, aiPlaceholder]);
    setInputValue('');
    setIsGenerating(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const searchResults = webSearchEnabled ? await fetchWebSearch(text) : [];

      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          useWebSearch: webSearchEnabled,
          searchResults,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '');
        updateMessage(aiId, {
          content: `**Error:** ${errText || `Request failed with status ${res.status}`}`,
          streaming: false,
          instant: true,
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assembled = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload) as
              | { type: 'delta'; text: string }
              | { type: 'done' }
              | { type: 'error'; error: string };
            if (evt.type === 'delta') {
              assembled += evt.text;
              updateMessage(aiId, { content: assembled });
            } else if (evt.type === 'error') {
              assembled += `\n\n**Error:** ${evt.error}`;
              updateMessage(aiId, { content: assembled });
            }
          } catch {
            // ignore parse errors for keep-alive lines
          }
        }
      }

      updateMessage(aiId, { streaming: false });
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') {
        updateMessage(aiId, { streaming: false });
      } else {
        updateMessage(aiId, {
          content: err instanceof Error ? `**Error:** ${err.message}` : 'Unknown error',
          streaming: false,
          instant: true,
        });
      }
    } finally {
      abortRef.current = null;
      setIsGenerating(false);
    }
  }, [inputValue, isGenerating, messages, webSearchEnabled, fetchWebSearch, updateMessage]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleSelectSuggestion = (topic: string) => {
    setInputValue(topic);
  };

  const handleNewChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInputValue('');
    setIsGenerating(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[100dvh] bg-background">
        {/* Top Bar */}
        <ChatTopBar
          onNewChat={handleNewChat}
          onToggleActivity={() => setShowActivityPanel((v) => !v)}
          onOpenBackup={() => setShowGDriveModal(true)}
        />

        {/* Messages Area */}
        <MessagesArea
          messages={messages}
          onSelectSuggestion={handleSelectSuggestion}
          isGenerating={
            isGenerating && !messages.some((m) => m.role === 'assistant' && m.streaming)
          }
        />

        {/* Input Zone */}
        <div className="flex-shrink-0 w-full px-4 pb-4 md:px-6 md:pb-6">
          <div className="max-w-[720px] mx-auto w-full relative">
            {/* Slash Command Menu */}
            <SlashCommandMenu
              query={slashQuery}
              visible={showSlashMenu}
              onSelect={handleSlashCommand}
              onClose={() => setShowSlashMenu(false)}
            />

            <ChatInput
              value={inputValue}
              onChange={handleInputChange}
              onSend={isGenerating ? handleStop : handleSend}
              isGenerating={isGenerating}
              webSearchEnabled={webSearchEnabled}
              onToggleWebSearch={() => setWebSearchEnabled((v) => !v)}
            />
          </div>
        </div>
      </div>

      {/* Agent Activity Panel */}
      <AgentActivityPanel
        open={showActivityPanel}
        onClose={() => setShowActivityPanel(false)}
        isActive={isGenerating}
      />

      {/* Google Drive Backup Modal */}
      <GoogleDriveBackupModal open={showGDriveModal} onClose={() => setShowGDriveModal(false)} />
    </AppLayout>
  );
}
