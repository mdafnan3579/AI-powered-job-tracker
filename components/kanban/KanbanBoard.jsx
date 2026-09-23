'use client';

import { useEffect, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COLUMNS, useKanban } from '@/hooks/useKanban';
import KanbanColumn from './KanbanColumn';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

export default function KanbanBoard({ applications, updateStatus }) {
  const { columns, handleDragEnd } = useKanban(applications, updateStatus);
  const isMobile = useIsMobile();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onStatusChange = async (id, status) => {
    try {
      await updateStatus(id, status);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err?.message ?? 'Could not update status.');
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {isMobile ? (
        <Tabs defaultValue="applied">
          <TabsList className="grid w-full grid-cols-4">
            {COLUMNS.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="px-1 text-xs">
                {c.label} ({columns[c.id]?.length ?? 0})
              </TabsTrigger>
            ))}
          </TabsList>
          {COLUMNS.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              <KanbanColumn
                id={c.id}
                label={c.label}
                applications={columns[c.id]}
                onStatusChange={onStatusChange}
                hideHeader
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="grid grid-cols-4 items-start gap-4">
          {COLUMNS.map((c) => (
            <KanbanColumn key={c.id} id={c.id} label={c.label} applications={columns[c.id]} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </DndContext>
  );
}
