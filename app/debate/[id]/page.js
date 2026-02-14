'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import useDebateStore from '@/store/useDebateStore';
import DebateView from '@/components/DebateView';

export default function DebatePage() {
  const params = useParams();
  const { setCurrentDebate, currentDebateId } = useDebateStore();

  useEffect(() => {
    if (params.id && params.id !== currentDebateId) {
      setCurrentDebate(params.id);
    }
  }, [params.id, currentDebateId, setCurrentDebate]);

  return <DebateView />;
}
