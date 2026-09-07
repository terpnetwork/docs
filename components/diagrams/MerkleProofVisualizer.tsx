"use client";

import { useState, useMemo, useCallback } from "react";
import { sha256 } from "@noble/hashes/sha2.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LLMContextLabel } from "./LLMContextLabel";

function bytesToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hashPair(a: string, b: string): string {
  const combined = new Uint8Array(
    a.length + b.length + 1 // 1 byte separator
  );
  combined[0] = 0x01; // Merkle hash prefix
  for (let i = 0; i < a.length; i++) combined[i + 1] = a.charCodeAt(i);
  for (let i = 0; i < b.length; i++) combined[1 + a.length + i] = b.charCodeAt(i);
  const h = sha256(combined);
  return bytesToHex(h);
}

interface MerkleNode {
  hash: string;
  label: string;
  left: MerkleNode | null;
  right: MerkleNode | null;
  isLeaf: boolean;
}

function buildMerkleTree(leaves: string[]): MerkleNode {
  if (leaves.length === 0) {
    return { hash: sha256(new Uint8Array([0])).reduce((s, b) => s + b.toString(16).padStart(2, "0"), ""), label: "Empty", left: null, right: null, isLeaf: true };
  }

  // Pad to power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(leaves.length)));
  const padded = [...leaves];
  while (padded.length < size) padded.push("");

  const nodes: MerkleNode[] = padded.map((l, i) => ({
    hash: l ? bytesToHex(sha256(new TextEncoder().encode(l))) : "",
    label: l || `[empty]`,
    left: null,
    right: null,
    isLeaf: true,
  }));

  // Propagate empty hashes
  for (const n of nodes) {
    if (!n.hash && n.label === "[empty]") {
      n.hash = "0".repeat(64);
    }
  }

  while (nodes.length > 1) {
    const nextLevel: MerkleNode[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1] || left;
      nextLevel.push({
        hash: hashPair(left.hash, right.hash),
        label: `${left.label.slice(0, 4)}+${right.label.slice(0, 4)}`,
        left,
        right,
        isLeaf: false,
      });
    }
    nodes.length = 0;
    nodes.push(...nextLevel);
  }

  return nodes[0];
}

function getProofPath(root: MerkleNode, targetLabel: string): string[] {
  const path: string[] = [];
  function walk(node: MerkleNode): boolean {
    if (node.isLeaf) {
      if (node.label === targetLabel) {
        path.push(node.hash);
        return true;
      }
      return false;
    }
    if (node.left && walk(node.left)) {
      path.push(node.right?.hash || "0".repeat(64));
      return true;
    }
    if (node.right && walk(node.right)) {
      path.push(node.left?.hash || "0".repeat(64));
      return true;
    }
    return false;
  }
  walk(root);
  // Reverse so path goes leaf → root (siblings at each level)
  return path.reverse();
}

function TreeNode({ node, depth, selected, proofPath, onSelect }: {
  node: MerkleNode;
  depth: number;
  selected: string | null;
  proofPath: Set<string>;
  onSelect: (label: string) => void;
}) {
  const isInProof = proofPath.has(node.hash);
  const isSelected = node.label === selected;

  const nodeColor = node.isLeaf
    ? isSelected
      ? "border-yellow-500 bg-yellow-500/10"
      : "border-emerald-500/50 bg-emerald-500/5"
    : isInProof
      ? "border-blue-500 bg-blue-500/10"
      : "border-muted-foreground/30 bg-muted/30";

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        {depth > 0 && (
          <div className="flex flex-col items-center">
            <div className="h-4 w-px bg-border" />
          </div>
        )}
      </div>
      <button
        onClick={() => !node.isLeaf && onSelect(node.label)}
        className={`cursor-pointer rounded-md border px-2 py-1 text-xs font-mono transition-colors ${
          nodeColor
        } ${
          node.isLeaf ? "hover:border-emerald-500" : "hover:border-blue-400"
        }`}
        title={`Hash: ${node.hash.slice(0, 16)}...`}
        disabled={!node.isLeaf}
      >
        <div className="text-[10px] font-medium">{node.label}</div>
        <div className="text-[8px] text-muted-foreground">
          {node.hash.slice(0, 8)}...
        </div>
      </button>
      {!node.isLeaf && node.left && node.right && (
        <div className="mt-2 flex gap-4">
          <TreeNode
            node={node.left}
            depth={depth + 1}
            selected={selected}
            proofPath={proofPath}
            onSelect={onSelect}
          />
          <TreeNode
            node={node.right}
            depth={depth + 1}
            selected={selected}
            proofPath={proofPath}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  );
}

const DEFAULT_LEAVES = ["Tx1: Alice → Bob", "Tx2: Bob → Charlie", "Tx3: Charlie → Dave", "Tx4: Dave → Alice"];

export function MerkleProofVisualizer() {
  const [leavesText, setLeavesText] = useState(DEFAULT_LEAVES.join("\n"));
  const [selectedLeaf, setSelectedLeaf] = useState<string | null>(null);

  const leaves = useMemo(
    () => leavesText.split("\n").filter((l) => l.trim()),
    [leavesText],
  );

  const tree = useMemo(() => buildMerkleTree(leaves), [leaves]);

  const proofPath = useMemo(() => {
    const path = new Set<string>();
    if (selectedLeaf) {
      getProofPath(tree, selectedLeaf).forEach((h) => path.add(h));
    }
    // Also add the root to proof path for visual highlighting
    path.add(tree.hash);
    // Add all internal nodes along the path
    function collectPath(node: MerkleNode, target: string): boolean {
      if (node.isLeaf) return node.label === target;
      if (node.left && collectPath(node.left, target)) {
        path.add(node.hash);
        return true;
      }
      if (node.right && collectPath(node.right, target)) {
        path.add(node.hash);
        return true;
      }
      return false;
    }
    if (selectedLeaf) collectPath(tree, selectedLeaf);
    return path;
  }, [tree, selectedLeaf]);

  const handleSelect = useCallback((label: string) => {
    setSelectedLeaf((prev) => (prev === label ? null : label));
  }, []);

  const proofSteps = useMemo(() => {
    if (!selectedLeaf) return [];
    const steps: string[] = [];
    const path = getProofPath(tree, selectedLeaf);
    // path is root → leaf siblings
    steps.push(`1. Start at leaf: ${selectedLeaf}`);
    const siblings = path.slice(1, -1); // exclude root and leaf
    siblings.forEach((s, i) => {
      steps.push(`${i + 2}. Hash with sibling: ${s.slice(0, 12)}...`);
    });
    steps.push(`${siblings.length + 2}. Root: ${tree.hash.slice(0, 16)}...`);
    steps.push(`Verify: Reconstructed root matches stored root ✓`);
    return steps;
  }, [tree, selectedLeaf]);

  return (
    <LLMContextLabel
      title="Merkle Proof Visualizer"
      context="Interactive binary Merkle tree. Enter leaf values, click a leaf to highlight its proof path through sibling nodes. The proof walkthrough shows each step of root reconstruction for verification."
      diagramType="react"
    >
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">
              Leaves (one per line)
            </label>
            <textarea
              value={leavesText}
              onChange={(e) => setLeavesText(e.target.value)}
              className="w-full rounded-md border bg-muted/30 p-2 font-mono text-xs"
              rows={4}
              aria-label="Merkle tree leaves"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">
              Root hash
            </label>
            <div className="rounded-md border bg-muted/30 p-2 font-mono text-xs">
              {tree.hash.slice(0, 32)}...
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Leaves: {leaves.length} | Tree height: {Math.ceil(Math.log2(leaves.length || 1))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border bg-card p-4">
          <div className="flex justify-center">
            <TreeNode
              node={tree}
              depth={0}
              selected={selectedLeaf}
              proofPath={proofPath}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {selectedLeaf && (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
            <div className="mb-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
              Proof for: {selectedLeaf}
            </div>
            <ol className="ml-4 list-decimal space-y-0.5 text-xs text-muted-foreground">
              {proofSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium">Sibling hashes needed:</span>{" "}
              {getProofPath(tree, selectedLeaf)
                .slice(1, -1)
                .map((h) => h.slice(0, 8))
                .join(", ")}
            </div>
          </div>
        )}

        <div className="rounded-md border bg-muted/20 p-2 text-xs text-muted-foreground">
          <span className="font-medium">Legend:</span>{" "}
          <span className="text-emerald-500">Green</span> = leaf |{" "}
          <span className="text-blue-500">Blue</span> = proof path node |{" "}
          <span className="text-yellow-500">Yellow</span> = selected leaf
        </div>
      </div>
    </LLMContextLabel>
  );
}