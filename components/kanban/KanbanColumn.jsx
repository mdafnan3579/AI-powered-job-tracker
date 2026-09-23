'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { COLUMNS } from '@/hooks/useKanban';
import { cn } from '@/lib/utils';
import ApplicationCard from './ApplicationCard';

// On mobile the board wraps this in a tab panel and hides the header (the tab shows name + count).
export default function KanbanColumn({ id, label, applications, onStatusChange, hideHeader = false }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const items = applications ?? [];
  const style = COLUMNS.find((c) => c.id === id);

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border bg-white/60 shadow-sm backdrop-blur">
      <div className={cn('h-1.5 bg-gradient-to-r', style?.bar)} aria-hidden="true" />
      {!hideHeader && (
        <div className="flex items-center justify-between px-3 py-2.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <span className={cn('size-2 rounded-full', style?.dot)} aria-hidden="true" />
            {label}
          </h3>
          <Badge variant="secondary" aria-label={`${items.length} applications in ${label}`}>
            {items.length}
          </Badge>
        </div>
      )}
      <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          role="list"
          aria-label={`${label} applications`}
          className={cn(
            'flex min-h-[180px] flex-1 flex-col gap-2.5 p-2.5 transition-colors duration-200',
            isOver && 'bg-indigo-50/80 ring-2 ring-inset ring-indigo-300'
          )}
        >
          {items.map((app, i) => (
            <div key={app.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <ApplicationCard application={app} onStatusChange={onStatusChange} />
            </div>
          ))}
          {items.length === 0 && (
            <p className="m-auto rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
              Drop applications here
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
