/**
 * Zustand client-side store for debate state.
 * @module store/useDebateStore
 */

import { create } from 'zustand';

const useDebateStore = create((set, get) => ({
  // ---- State ----
  debates: [],
  currentDebateId: null,
  currentDebate: null,
  streaming: false,
  streamAgent: null, // 'advocate' | 'critic' | 'judge'
  streamContent: '',
  judgeSteps: [],
  error: null,

  // ---- Actions ----

  /** Set the current debate ID and fetch it. */
  setCurrentDebate: (debateId) => {
    set({ currentDebateId: debateId });
    if (debateId) {
      get().fetchDebate(debateId);
    } else {
      set({ currentDebate: null });
    }
  },

  /** Fetch debate list from API. */
  fetchDebates: async () => {
    try {
      const res = await fetch('/api/debates');
      if (res.ok) {
        const debates = await res.json();
        set({ debates });
      }
    } catch (e) {
      console.error('Failed to fetch debates:', e);
    }
  },

  /** Fetch a single debate. */
  fetchDebate: async (debateId) => {
    try {
      const res = await fetch(`/api/debates/${debateId}`);
      if (res.ok) {
        const debate = await res.json();
        set({ currentDebate: debate });
      }
    } catch (e) {
      console.error('Failed to fetch debate:', e);
    }
  },

  /** Create a new debate. Returns the debate object. */
  createDebate: async (idea, criteria = []) => {
    set({ error: null });
    try {
      const res = await fetch('/api/debates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, criteria }),
      });
      if (!res.ok) {
        throw new Error('Failed to create debate');
      }
      const debate = await res.json();
      set((state) => ({
        debates: [debate, ...state.debates],
        currentDebateId: debate.id,
        currentDebate: debate,
      }));
      return debate;
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  /** Start a debate round (SSE stream). */
  startRound: async () => {
    const { currentDebateId } = get();
    if (!currentDebateId) return;

    set({ streaming: true, streamContent: '', streamAgent: null, judgeSteps: [], error: null });

    try {
      const res = await fetch(`/api/debates/${currentDebateId}/stream`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            set({ streaming: false, streamContent: '', streamAgent: null });
            get().fetchDebate(currentDebateId);
            return;
          }

          try {
            const event = JSON.parse(data);
            handleStreamEvent(event, set, get);
          } catch {
            // Ignore parse errors
          }
        }
      }

      set({ streaming: false, streamContent: '', streamAgent: null });
      get().fetchDebate(currentDebateId);
    } catch (e) {
      console.error('Stream error:', e);
      set({ streaming: false, error: e.message });
    }
  },

  /** Fork the debate at a node. */
  fork: async (nodeId, label) => {
    const { currentDebateId } = get();
    if (!currentDebateId) return;

    try {
      const res = await fetch(`/api/debates/${currentDebateId}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, label }),
      });
      if (res.ok) {
        const debate = await res.json();
        set({ currentDebate: debate });
      }
    } catch (e) {
      console.error('Fork error:', e);
    }
  },

  /** Rewind to a specific node. */
  rewind: async (nodeId) => {
    const { currentDebateId } = get();
    if (!currentDebateId) return;

    try {
      const res = await fetch(`/api/debates/${currentDebateId}/rewind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId }),
      });
      if (res.ok) {
        const debate = await res.json();
        set({ currentDebate: debate });
      }
    } catch (e) {
      console.error('Rewind error:', e);
    }
  },

  /** Clear current debate. */
  clearCurrent: () => {
    set({ currentDebateId: null, currentDebate: null, streaming: false, streamContent: '', streamAgent: null, judgeSteps: [] });
  },
}));

/**
 * Handle a single SSE event.
 */
function handleStreamEvent(event, set, get) {
  switch (event.type) {
    case 'status':
      set({ streamAgent: event.agent, streamContent: '' });
      break;

    case 'stream':
      set({ streamAgent: event.agent, streamContent: event.fullContent || '' });
      break;

    case 'node':
      // Refresh the debate to get the new node in the tree
      get().fetchDebate(get().currentDebateId);
      break;

    case 'judge_step':
      set((state) => ({
        judgeSteps: [...state.judgeSteps, event],
      }));
      break;

    case 'verdict':
    case 'evaluation':
      get().fetchDebate(get().currentDebateId);
      break;

    case 'round_complete':
      set({ streaming: false, streamContent: '', streamAgent: null });
      get().fetchDebate(get().currentDebateId);
      break;

    case 'error':
      set({ error: event.message });
      break;
  }
}

export default useDebateStore;
