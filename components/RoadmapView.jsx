"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useProductStore, { TEAM_MEMBERS } from "@/store/useProductStore";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const SPRINTS = [
  { id: "sprint-1", label: "Sprint 1", subtitle: "Current", accent: "brand" },
  { id: "sprint-2", label: "Sprint 2", subtitle: "Next", accent: "blue" },
  { id: "sprint-3", label: "Sprint 3", subtitle: "Later", accent: "violet" },
  { id: "backlog", label: "Backlog", subtitle: "Unprioritized", accent: "gray" },
];

const ACCENT = {
  brand: { header: "bg-brand-50 border-brand-200 text-brand-800", dot: "bg-brand-500", badge: "bg-brand-50 text-brand-700 border-brand-200", ring: "ring-brand-200" },
  blue:  { header: "bg-blue-50 border-blue-200 text-blue-800",    dot: "bg-blue-500",  badge: "bg-blue-50 text-blue-700 border-blue-200",    ring: "ring-blue-200" },
  violet:{ header: "bg-violet-50 border-violet-200 text-violet-800",dot:"bg-violet-500",badge: "bg-violet-50 text-violet-700 border-violet-200",ring: "ring-violet-200" },
  gray:  { header: "bg-gray-50 border-gray-200 text-gray-600",    dot: "bg-gray-400",  badge: "bg-gray-50 text-gray-500 border-gray-200",    ring: "ring-gray-200" },
};

const CATEGORY = {
  ui: { label: "UI", color: "text-cyan-700", bg: "bg-cyan-50" },
  backend: { label: "Backend", color: "text-violet-700", bg: "bg-violet-50" },
  data: { label: "Data", color: "text-amber-700", bg: "bg-amber-50" },
  workflow: { label: "Workflow", color: "text-blue-700", bg: "bg-blue-50" },
  integration: { label: "Integration", color: "text-brand-700", bg: "bg-brand-50" },
  infrastructure: { label: "Infra", color: "text-gray-600", bg: "bg-gray-100" },
};

const STATUS_CFG = {
  planned:       { label: "Planned",     color: "text-gray-500",  bg: "bg-gray-100",  dot: "bg-gray-400" },
  "in-progress": { label: "In Progress", color: "text-blue-700",  bg: "bg-blue-50",   dot: "bg-blue-500" },
  done:          { label: "Done",        color: "text-brand-700", bg: "bg-brand-50",  dot: "bg-brand-500" },
};

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

/* ------------------------------------------------------------------ */
/*  Inline editable number                                              */
/* ------------------------------------------------------------------ */
function EditableNumber({ value, onSave, suffix = "", placeholder = "—" }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");
  const ref = useRef(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  if (editing) {
    return (
      <input
        ref={ref}
        type="number"
        min={0}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { onSave(val === "" ? null : Number(val)); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") { onSave(val === "" ? null : Number(val)); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
        className="w-12 px-1 py-0.5 rounded text-[10px] bg-white border border-brand-300 text-gray-800 text-center focus:outline-none tabular-nums"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  return (
    <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="text-[10px] tabular-nums text-gray-500 hover:text-brand-700 hover:bg-brand-50 px-1 py-0.5 rounded transition-colors">
      {value != null ? `${value}${suffix}` : placeholder}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Roadmap Card                                                        */
/* ------------------------------------------------------------------ */
function RoadmapCard({ feature, roadmapItem, onMove, onRemove, onOpen, onTogglePin, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const cat = CATEGORY[feature.category] || CATEGORY.ui;
  const st = STATUS_CFG[roadmapItem.status] || STATUS_CFG.planned;
  const assignee = TEAM_MEMBERS.find((m) => m.id === roadmapItem.assigneeId);

  useEffect(() => {
    if (!showMenu) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showMenu]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-lg border p-3 hover:shadow-md transition-all cursor-pointer group relative ${
        roadmapItem.pinned ? "border-amber-300 ring-1 ring-amber-100" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onOpen(feature.id)}
    >
      {/* Pin indicator */}
      {roadmapItem.pinned && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
          </svg>
        </div>
      )}

      {/* Top row: category + menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${cat.bg} ${cat.color}`}>{cat.label}</span>
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${st.bg} ${st.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-6 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { onTogglePin(feature.id); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                  {roadmapItem.pinned ? "Unpin" : "Pin to Top"}
                </button>
                <div className="border-t border-gray-100 my-0.5" />
                {/* Status */}
                {Object.entries(STATUS_CFG).filter(([k]) => k !== roadmapItem.status).map(([key, cfg]) => (
                  <button key={key} onClick={() => { onUpdate(feature.id, { status: key }); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    Mark {cfg.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-0.5" />
                {/* Move */}
                {SPRINTS.filter((s) => s.id !== roadmapItem.sprint).map((s) => (
                  <button key={s.id} onClick={() => { onMove(feature.id, s.id); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-50">
                    Move to {s.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-0.5" />
                <button onClick={() => { onRemove(feature.id); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-50">
                  Remove
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-[12px] font-semibold text-gray-800 leading-snug mb-1">{feature.title}</h4>
      <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mb-2">{feature.description}</p>

      {/* Resource row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Story Points */}
          <div className="flex items-center gap-1" title="Story Points">
            <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <EditableNumber value={roadmapItem.storyPoints} onSave={(v) => onUpdate(feature.id, { storyPoints: v })} suffix=" SP" placeholder="SP" />
          </div>
          {/* Eng Days */}
          <div className="flex items-center gap-1" title="Engineering Days">
            <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <EditableNumber value={roadmapItem.engDays} onSave={(v) => onUpdate(feature.id, { engDays: v })} suffix="d" placeholder="days" />
          </div>
        </div>

        {/* Assignee */}
        <AssigneePicker
          currentId={roadmapItem.assigneeId}
          onSelect={(id) => onUpdate(feature.id, { assigneeId: id })}
        />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Assignee picker                                                     */
/* ------------------------------------------------------------------ */
function AssigneePicker({ currentId, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const assignee = TEAM_MEMBERS.find((m) => m.id === currentId);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
      >
        {assignee ? (
          <div className={`w-5 h-5 rounded-full ${assignee.color} flex items-center justify-center text-[8px] font-bold text-white`} title={assignee.name}>
            {assignee.initials}
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center" title="Assign">
            <svg className="w-2.5 h-2.5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 bottom-7 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40" onClick={(e) => e.stopPropagation()}>
            {TEAM_MEMBERS.map((m) => (
              <button key={m.id} onClick={() => { onSelect(m.id); setOpen(false); }} className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 flex items-center gap-2 ${currentId === m.id ? "text-brand-700 font-medium" : "text-gray-600"}`}>
                <div className={`w-5 h-5 rounded-full ${m.color} flex items-center justify-center text-[8px] font-bold text-white`}>{m.initials}</div>
                {m.name}
                {currentId === m.id && <svg className="w-3 h-3 ml-auto text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              </button>
            ))}
            {currentId && (
              <>
                <div className="border-t border-gray-100 my-0.5" />
                <button onClick={() => { onSelect(null); setOpen(false); }} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-400 hover:bg-gray-50">Unassign</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main RoadmapView                                                    */
/* ------------------------------------------------------------------ */
export default function RoadmapView() {
  const features = useProductStore((s) => s.features);
  const roadmapItems = useProductStore((s) => s.roadmapItems);
  const addAllToRoadmap = useProductStore((s) => s.addAllToRoadmap);
  const moveRoadmapItem = useProductStore((s) => s.moveRoadmapItem);
  const removeFromRoadmap = useProductStore((s) => s.removeFromRoadmap);
  const togglePinRoadmapItem = useProductStore((s) => s.togglePinRoadmapItem);
  const updateRoadmapItem = useProductStore((s) => s.updateRoadmapItem);
  const selectFeature = useProductStore((s) => s.selectFeature);
  const setView = useProductStore((s) => s.setView);

  const [dragOver, setDragOver] = useState(null);

  const getSprintItems = (sprintId) => {
    const items = roadmapItems
      .filter((r) => r.sprint === sprintId)
      .map((r) => ({ ...r, feature: features.find((f) => f.id === r.featureId) }))
      .filter((r) => r.feature);
    // Pinned items first
    items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return items;
  };

  const getSprintPoints = (sprintId) =>
    getSprintItems(sprintId).reduce((sum, r) => sum + (r.storyPoints || 0), 0);

  const getSprintDays = (sprintId) =>
    getSprintItems(sprintId).reduce((sum, r) => sum + (r.engDays || 0), 0);

  const totalPoints = roadmapItems.reduce((sum, r) => sum + (r.storyPoints || 0), 0);
  const totalDays = roadmapItems.reduce((sum, r) => sum + (r.engDays || 0), 0);

  const handleDragStart = (e, featureId) => { e.dataTransfer.setData("featureId", featureId); };
  const handleDragOver = (e, sprintId) => { e.preventDefault(); setDragOver(sprintId); };
  const handleDrop = (e, sprintId) => {
    e.preventDefault();
    const featureId = e.dataTransfer.getData("featureId");
    if (featureId) moveRoadmapItem(featureId, sprintId);
    setDragOver(null);
  };

  const isEmpty = roadmapItems.length === 0;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-0.5">Roadmap</h1>
          <p className="text-sm text-gray-400">
            {roadmapItems.length} items &middot; {totalPoints} SP{totalDays > 0 ? ` · ${totalDays} eng days` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {features.length > 0 && roadmapItems.length < features.length && (
            <button onClick={addAllToRoadmap} className="px-3.5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add All Features
            </button>
          )}
        </div>
      </motion.div>

      {/* Empty state */}
      {isEmpty && (
        <motion.div variants={fadeUp} className="card rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Your roadmap is empty</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            {features.length > 0
              ? "Add recommended features to your roadmap and organize them into sprints."
              : "Generate feature recommendations first, then add them to your roadmap."}
          </p>
          {features.length > 0 ? (
            <div className="flex items-center justify-center gap-3">
              <button onClick={addAllToRoadmap} className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-sm font-medium transition-colors">Add All Features to Roadmap</button>
              <button onClick={() => setView("features")} className="px-5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-sm font-medium transition-colors">Pick Individual Features</button>
            </div>
          ) : (
            <button onClick={() => setView("features")} className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-sm font-medium transition-colors">Go to Features</button>
          )}
        </motion.div>
      )}

      {/* Sprint lanes */}
      {!isEmpty && (
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3 items-start">
          {SPRINTS.map((sprint) => {
            const ac = ACCENT[sprint.accent];
            const items = getSprintItems(sprint.id);
            const points = getSprintPoints(sprint.id);
            const days = getSprintDays(sprint.id);
            const isDragTarget = dragOver === sprint.id;

            return (
              <div
                key={sprint.id}
                className={`rounded-xl border transition-all min-h-[300px] ${isDragTarget ? `border-brand-400 bg-brand-50/30 ring-2 ${ac.ring}` : "border-gray-200 bg-gray-50/50"}`}
                onDragOver={(e) => handleDragOver(e, sprint.id)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, sprint.id)}
              >
                {/* Sprint header */}
                <div className={`px-3 py-2.5 rounded-t-xl border-b ${ac.header}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${ac.dot}`} />
                      <h3 className="text-[12px] font-semibold">{sprint.label}</h3>
                    </div>
                    <span className="text-[10px] font-medium opacity-70">{items.length}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {points > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${ac.badge}`}>{points} SP</span>}
                    {days > 0 && <span className="text-[9px] opacity-60">{days}d</span>}
                  </div>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2">
                  <AnimatePresence>
                    {items.map((item) => (
                      <div key={item.featureId} draggable onDragStart={(e) => handleDragStart(e, item.featureId)}>
                        <RoadmapCard
                          feature={item.feature}
                          roadmapItem={item}
                          onMove={moveRoadmapItem}
                          onRemove={removeFromRoadmap}
                          onOpen={selectFeature}
                          onTogglePin={togglePinRoadmapItem}
                          onUpdate={updateRoadmapItem}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[11px] text-gray-300">Drag features here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
