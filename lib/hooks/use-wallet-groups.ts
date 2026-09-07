'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/lib/wallet/use-wallet';
import { useCalendarGroups, useGroup } from './use-calendar';

/**
 * Check if the connected wallet is a member of a specific group.
 * Layered: direct member list first, then DAO voting power check.
 */
export function useIsGroupMember(groupId?: string) {
  const { address } = useWallet();
  const { data: groupData } = useGroup(groupId);

  return useQuery({
    queryKey: ['group-membership', address, groupId],
    queryFn: async (): Promise<boolean> => {
      if (!address || !groupData) return false;

      const group = groupData.group;

      // Layer 1: direct member list
      if (group.members?.includes(address)) return true;

      // Layer 2: DAO voting power
      if (group.dao_addr) {
        // Phase 2: query DAO voting module for wallet's voting power
        // const power = await queryContractSmart(group.dao_addr, {
        //   voting_power_at_height: { address },
        // });
        // return BigInt(power.power) > 0n;
        return false;
      }

      // Demo mode: no membership restrictions when groups have no members/dao
      if (!group.members && !group.dao_addr) return true;

      return false;
    },
    enabled: !!address && !!groupId,
  });
}

/** Returns group IDs where the connected wallet has management permissions. */
export function useWalletManagedGroups() {
  const { address } = useWallet();
  const { data: groupsData } = useCalendarGroups();

  return useQuery({
    queryKey: ['wallet-managed-groups', address],
    queryFn: async (): Promise<string[]> => {
      if (!address || !groupsData) return [];

      // Demo mode: wallet is member of all groups (no restrictions configured)
      const managed: string[] = [];
      for (const gr of groupsData.groups) {
        const group = gr.group;
        // Layer 1: direct member check
        if (group.members?.includes(address)) {
          managed.push(group.id);
          continue;
        }
        // Layer 2: DAO check (Phase 2)
        // Demo: if no restrictions, allow all
        if (!group.members && !group.dao_addr) {
          managed.push(group.id);
        }
      }
      return managed;
    },
    enabled: !!address,
  });
}
