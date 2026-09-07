'use client';

import { useQuery } from '@tanstack/react-query';
import { resolveCalendarAddress } from '@/lib/queries/resolve-calendar';
import { BILLBOARD_ACCOUNT } from '@/lib/wallet/config';

/**
 * Resolves the calendar contract address via:
 *   1. Indexer: GET /indexer/dao-calendar/resolve/{account}
 *   2. Fallback: billboard text records → DAO → contracts-by-creator probe
 *
 * The resolved address is cached with a long staleTime since it rarely changes.
 */
export function useCalendarAddress(account: string = BILLBOARD_ACCOUNT) {
  return useQuery({
    queryKey: ['calendar-address', account],
    queryFn: () => resolveCalendarAddress(account),
    staleTime: 30 * 60 * 1000, // 30 min — address changes rarely, aligned with sessionStorage cache
    retry: 2,
  });
}
