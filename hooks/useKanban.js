'use client';

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

export const COLUMNS = [
  { id: 'applied', label: 'Applied', bar: 'from-sky-500 to-blue-500', dot: 'bg-sky-500' },
  { id: 'interview', label: 'Interview', bar: 'from-amber-400 to-orange-500', dot: 'bg-amber-500' },
  { id: 'offer', label: 'Offer', bar: 'from-emerald-400 to-teal-500', dot: 'bg-emerald-500' },
  { id: 'rejected', label: 'Rejected', bar: 'from-rose-400 to-red-500', dot: 'bg-rose-500' },
];

export function useKanban(applications, updateStatus) {
  const columns = useMemo(() => {
    const grouped = { applied: [], interview: [], offer: [], rejected: [] };
    for (const app of applications ?? []) {
      (grouped[app?.status] ?? grouped.applied).push(app);
    }
    return grouped;
  }, [applications]);

  // The drop target can be a column (id = status) or another card (id = application id).
  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      if (!over || active.id === over.id) return;
      const overStatus = COLUMNS.some((c) => c.id === over.id)
        ? over.id
        : (applications ?? []).find((a) => a.id === over.id)?.status;
      const current = (applications ?? []).find((a) => a.id === active.id);
      if (!overStatus || !current || current.status === overStatus) return;
      try {
        await updateStatus(active.id, overStatus);
        toast.success(`Moved to ${COLUMNS.find((c) => c.id === overStatus)?.label ?? overStatus}`);
      } catch (err) {
        toast.error(err?.message ?? 'Could not move application.');
      }
    },
    [applications, updateStatus]
  );

  return { columns, handleDragEnd };
}
