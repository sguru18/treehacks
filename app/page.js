"use client";

import useProductStore from "@/store/useProductStore";
import LandingPage from "@/components/LandingPage";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import SourcesView from "@/components/SourcesView";
import InsightsView from "@/components/InsightsView";
import FeaturesView from "@/components/FeaturesView";
import FeatureDetail from "@/components/FeatureDetail";
import RoadmapView from "@/components/RoadmapView";
import { AnimatePresence, motion } from "framer-motion";

const VIEWS = {
  dashboard: Dashboard,
  sources: SourcesView,
  insights: InsightsView,
  features: FeaturesView,
  "feature-detail": FeatureDetail,
  roadmap: RoadmapView,
};

export default function Home() {
  const showApp = useProductStore((s) => s.showApp);
  const view = useProductStore((s) => s.view);
  const View = VIEWS[view] || Dashboard;

  if (!showApp) {
    return <LandingPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-10 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <View />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
