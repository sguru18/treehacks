'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/* ---- Icons (inline SVGs) ---- */
function PencilIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function SparkleIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

/**
 * EditableField — wraps any AI-generated content with inline edit + AI refine capabilities.
 *
 * Props:
 *   value       — current value (string or string[])
 *   onSave      — called with the new value when the user saves
 *   type        — 'text' | 'textarea' | 'list'  (controls editor shape)
 *   label       — human-readable label for the section (shown in refine prompt)
 *   context     — object with extra context for AI refinement (featureTitle, featureDescription, etc.)
 *   children    — the normal view-mode rendering (pass-through)
 *   className   — optional wrapper class
 */
export default function EditableField({ value, onSave, type = 'textarea', label = '', context = {}, children, className = '' }) {
  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'refine'
  const [draft, setDraft] = useState('');
  const [refineInput, setRefineInput] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState(null);
  const textareaRef = useRef(null);
  const refineInputRef = useRef(null);

  // Convert value to editor-friendly string
  const valueToString = useCallback((v) => {
    if (Array.isArray(v)) return v.join('\n');
    return v || '';
  }, []);

  // Convert editor string back to the correct type
  const stringToValue = useCallback((s) => {
    if (type === 'list') return s.split('\n').filter((line) => line.trim() !== '');
    return s;
  }, [type]);

  // Enter edit mode
  const startEdit = (e) => {
    e.stopPropagation();
    setDraft(valueToString(value));
    setMode('edit');
  };

  // Enter refine mode
  const startRefine = (e) => {
    e.stopPropagation();
    setRefineInput('');
    setRefineError(null);
    setMode('refine');
  };

  // Save direct edit
  const saveEdit = () => {
    const newVal = stringToValue(draft);
    onSave(newVal);
    setMode('view');
  };

  // Cancel any mode
  const cancel = () => {
    setMode('view');
    setRefineInput('');
    setRefineError(null);
  };

  // Submit AI refinement
  const submitRefine = async () => {
    if (!refineInput.trim()) return;
    setRefining(true);
    setRefineError(null);
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: value,
          instructions: refineInput.trim(),
          context: {
            ...context,
            sectionLabel: label,
            contentType: type === 'list' ? 'list' : 'text',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refinement failed');
      onSave(data.refined);
      setMode('view');
      setRefineInput('');
    } catch (err) {
      setRefineError(err.message);
    } finally {
      setRefining(false);
    }
  };

  // Auto-focus editors
  useEffect(() => {
    if (mode === 'edit' && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
    if (mode === 'refine' && refineInputRef.current) {
      refineInputRef.current.focus();
    }
  }, [mode]);

  // Keyboard shortcuts
  const handleEditKeyDown = (e) => {
    if (e.key === 'Escape') cancel();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit();
  };

  const handleRefineKeyDown = (e) => {
    if (e.key === 'Escape') cancel();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitRefine();
    }
  };

  /* ---- View mode ---- */
  if (mode === 'view') {
    return (
      <div className={`group/editable relative ${className}`}>
        {children}
        {/* Hover toolbar */}
        <div className="absolute top-0 right-0 opacity-0 group-hover/editable:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-0.5">
          <button
            onClick={startEdit}
            title="Edit"
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <PencilIcon />
          </button>
          <button
            onClick={startRefine}
            title="Refine with Daisy"
            className="p-1 rounded-md hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
          >
            <SparkleIcon />
          </button>
        </div>
      </div>
    );
  }

  /* ---- Edit mode ---- */
  if (mode === 'edit') {
    return (
      <div className={`space-y-2 ${className}`} onClick={(e) => e.stopPropagation()}>
        {type === 'text' ? (
          <input
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleEditKeyDown}
            className="w-full px-3 py-2 border border-brand-300 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white"
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleEditKeyDown}
            rows={type === 'list' ? Math.max(3, (draft.match(/\n/g) || []).length + 2) : 5}
            className="w-full px-3 py-2 border border-brand-300 rounded-lg text-[12px] text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white resize-y font-mono"
            placeholder={type === 'list' ? 'One item per line...' : ''}
          />
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {type === 'list' ? 'One item per line' : 'Cmd+Enter to save'}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={cancel} className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={saveEdit} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-700 text-white hover:bg-brand-800 transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Refine mode ---- */
  return (
    <div className={`space-y-2 ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Show current content dimmed */}
      <div className="opacity-60 pointer-events-none">{children}</div>

      {/* Instruction input */}
      <div className="border border-brand-300 rounded-lg bg-brand-50/30 p-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <SparkleIcon className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-[11px] font-semibold text-brand-700">Refine with Daisy</span>
          {label && <span className="text-[10px] text-gray-400">— {label}</span>}
        </div>
        <input
          ref={refineInputRef}
          value={refineInput}
          onChange={(e) => setRefineInput(e.target.value)}
          onKeyDown={handleRefineKeyDown}
          disabled={refining}
          placeholder="e.g. &quot;Make this more specific to mobile users&quot; or &quot;Add error handling scenarios&quot;"
          className="w-full px-3 py-2 border border-brand-200 rounded-lg text-[12px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white disabled:opacity-50"
        />
        {refineError && (
          <p className="text-[11px] text-red-600">{refineError}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {refining ? 'Daisy is refining...' : 'Enter to submit'}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={cancel} disabled={refining} className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={submitRefine}
              disabled={refining || !refineInput.trim()}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-700 text-white hover:bg-brand-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {refining ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <SparkleIcon className="w-3 h-3" />
                  Refine
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
