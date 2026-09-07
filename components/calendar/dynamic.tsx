'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy stub only — no wallet graph. Prefer not using this in MDX at all.
 */
export const DynamicConnectCalendar = dynamic(
  () => import('./index').then((m) => ({ default: m.ConnectCalendar })),
  {
    ssr: true,
    loading: () => null,
  },
);
