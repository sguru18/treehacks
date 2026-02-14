'use client';

import useDebateStore from '@/store/useDebateStore';
import Dashboard from '@/components/Dashboard';
import DebateView from '@/components/DebateView';

export default function Home() {
  const { currentDebateId } = useDebateStore();

  if (currentDebateId) {
    return <DebateView />;
  }

  return <Dashboard />;
}
