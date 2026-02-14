"use client";

import { motion } from "framer-motion";
import useProductStore from "@/store/useProductStore";

function DaisyLogo({ size = 20 }) {
  const r = size / 2;
  const petalRx = r * 0.34;
  const petalRy = r * 0.58;
  const petalDist = r * 0.42;
  const petals = 6;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse
          key={i}
          cx={r}
          cy={r - petalDist}
          rx={petalRx}
          ry={petalRy}
          fill="white"
          opacity={0.92}
          transform={`rotate(${(i * 360) / petals} ${r} ${r})`}
        />
      ))}
      <circle cx={r} cy={r} r={r * 0.28} fill="#facc15" />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
  },
  {
    id: "sources",
    label: "Sources",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
    countKey: "sources",
  },
  {
    id: "insights",
    label: "Insights",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    ),
    countKey: "insights",
  },
  {
    id: "features",
    label: "Features",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        />
      </svg>
    ),
    countKey: "features",
  },
];

export default function Sidebar() {
  const view = useProductStore((s) => s.view);
  const setView = useProductStore((s) => s.setView);
  const sources = useProductStore((s) => s.sources);
  const insights = useProductStore((s) => s.insights);
  const features = useProductStore((s) => s.features);

  const counts = {
    sources: sources.length,
    insights: insights.length,
    features: features.length,
  };

  return (
    <aside className="w-60 h-screen flex flex-col bg-white border-r border-gray-200 shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center">
            <DaisyLogo size={20} />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-gray-900 leading-tight">
              Daisy
            </h1>
            <p className="text-[11px] text-gray-400 leading-tight">
              Product Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((navItem) => {
          const isActive =
            view === navItem.id ||
            (navItem.id === "features" && view === "feature-detail");
          const count = navItem.countKey ? counts[navItem.countKey] : null;

          return (
            <motion.button
              key={navItem.id}
              onClick={() => setView(navItem.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-brand-50 text-brand-800"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={isActive ? "text-brand-700" : "text-gray-400"}>
                {navItem.icon}
              </span>
              <span>{navItem.label}</span>
              {count > 0 && (
                <span
                  className={`ml-auto text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-brand-100 text-brand-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-300">
          Daisy &middot; TreeHacks 2025
        </p>
      </div>
    </aside>
  );
}
