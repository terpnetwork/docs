/**
 * Compatibility re-exports. Prefer per-diagram paths so MDX does not pull
 * every visualizer into one module:
 *
 *   import { DynamicMermaidDiagram } from '@/components/diagrams/dynamic/mermaid'
 *   import { DynamicMerkleProofVisualizer } from '@/components/diagrams/dynamic/merkle-proof'
 */
export { DynamicMermaidDiagram } from "./dynamic/mermaid";
export { DynamicHashExplorer } from "./dynamic/hash-explorer";
export { DynamicMerkleProofVisualizer } from "./dynamic/merkle-proof";
export { DynamicSparseDenseVisualizer } from "./dynamic/sparse-dense";
export { DynamicMMRGrowthSimulator } from "./dynamic/mmr";
export { DynamicPatriciaTrieExplorer } from "./dynamic/patricia";
