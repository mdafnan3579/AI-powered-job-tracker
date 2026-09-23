'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex h-9 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground', className)}
      {...props}
    />
  );
}
function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow',
        className
      )}
      {...props}
    />
  );
}
function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn('mt-3 focus-visible:outline-none', className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
