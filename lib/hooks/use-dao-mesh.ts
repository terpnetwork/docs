'use client';

import { useQuery } from '@tanstack/react-query';
import { resolveDaoMesh } from '@/lib/queries/resolve-calendar';
import {
  createMeshQueryClient,
  type ResolvedMesh,
} from '@/lib/mesh';
import { BILLBOARD_ACCOUNT } from '@/lib/wallet/config';

/**
 * Resolve mesh.v1 for Connect (public read path).
 * Cached long — descriptor changes only via governance / text records.
 */
export function useDaoMesh(account: string = BILLBOARD_ACCOUNT) {
  return useQuery({
    queryKey: ['dao-mesh', account],
    queryFn: () => resolveDaoMesh(account),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Mesh query-plane client once mesh is resolved.
 */
export function useMeshQueryClient(mesh: ResolvedMesh | undefined) {
  if (!mesh) return undefined;
  return createMeshQueryClient(mesh);
}
