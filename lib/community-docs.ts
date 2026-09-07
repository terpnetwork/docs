import type { z } from 'zod';

/**
 * Config file style design for locations of MDX docs from community projects.
 * Used by Fumadocs source loader and sync functions in core lib.
 * Avoids reinventing the wheel by leveraging fumadocs-core/source and existing loader.
 */
export interface CommunityProject {
  name: string;
  githubUrl: string; // raw GitHub URL for MDX/README
  targetPath: string; // path under content/docs/community/...
  title: string;
  description: string;
}

export const communityDocConfig = {
  projects: [] as const,
} as const;

export function getCommunityProject(name: string): CommunityProject | undefined {
  // return communityDocConfig.projects.find((p) => p.name === name); 
  return undefined
}

export function getAllCommunityProjects(): readonly CommunityProject[] {
  return communityDocConfig.projects;
}

/**
 * Loads community docs into Fumadocs source (can extend with fs sync or remote loader).
 * Integrates with lib/source.ts without duplicating Fumadocs logic.
 */
export function createCommunitySource() {
  // return communityDocConfig.projects.reduce((acc, project) => {
  //   acc[project.name] = {
  //     baseUrl: `/docs/${project.targetPath}`,
  //     source: [],
  //   };
  //   return acc;
  // }, {} as Record<string, any>);
}

export async function syncCommunityDocs() {
  console.info('Fetching community MDX from GitHub for lazy/async loading...');
  const projects = getAllCommunityProjects();
  for (const project of projects) {
    try {
      const res = await fetch(project.githubUrl);
      if (res.ok) {
        const content = await res.text();
        // In build, write to content/docs/community/... .mdx
        console.info(`Fetched ${project.name} docs from ${project.githubUrl}`);
      }
    } catch (e) {
      console.error(`Failed to fetch ${project.name}:`, e);
    }
  }
  return projects;
}
