"use client";

import { useState, useMemo, useCallback } from "react";
import { sha256 } from "@noble/hashes/sha2.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LLMContextLabel } from "./LLMContextLabel";

function bytesToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hashData(data: string): string {
  return bytesToHex(sha256(new TextEncoder().encode(data)));
}

function shortHash(h: string): string {
  return h.slice(0, 6);
}

type PatriciaNodeType = "branch" | "extension" | "leaf";

interface PatriciaNode {
  type: PatriciaNodeType;
  label: string;
  hash: string;
  value?: string;
  children: PatriciaNode[];
  nibble?: string; // hex nibble for branch children
  sharedPrefix?: string; // extension node shared prefix
}

function buildPatriciaTrie(entries: { key: string; value: string }[]): PatriciaNode {
  if (entries.length === 0) {
    return { type: "leaf", label: "empty", hash: "0".repeat(64), children: [] };
  }

  // Sort keys for deterministic display
  const sorted = [...entries].sort((a, b) => a.key.localeCompare(b.key));

  // Build a simplified Patricia trie
  // For each key, we walk the hex nibbles
  const root: PatriciaNode = {
    type: "branch",
    label: "Root",
    hash: "",
    children: [],
  };

  for (const entry of sorted) {
    const nibbles = Array.from(entry.key).flatMap((c) => {
      const hex = c.charCodeAt(0).toString(16);
      return hex.split("");
    });
    insert(root, nibbles, 0, entry.key, entry.value);
  }

  // Compute hashes bottom-up
  computeHashes(root);

  return root;
}

function insert(node: PatriciaNode, nibbles: string[], depth: number, key: string, value: string) {
  if (depth >= nibbles.length) {
    // Leaf node at this position
    const existingLeaf = node.children.find((c) => c.type === "leaf");
    if (existingLeaf) {
      existingLeaf.value = value;
      existingLeaf.label = key;
    } else {
      node.children.push({
        type: "leaf",
        label: key,
        hash: "",
        value,
        children: [],
      });
    }
    return;
  }

  const nibble = nibbles[depth];

  // Look for a branch child with this nibble
  let branchChild = node.children.find((c) => c.nibble === nibble);

  if (!branchChild) {
    // Look for an extension node that shares a prefix
    const extChild = node.children.find((c) => c.type === "extension");
    if (extChild) {
      const sharedPrefix = extChild.sharedPrefix || "";
      if (sharedPrefix[0] === nibble) {
        // Continue down extension
        insert(extChild, nibbles, depth + 1, key, value);
        return;
      }
    }

    // Create new branch child
    branchChild = {
      type: "branch",
      label: `nibble ${nibble}`,
      hash: "",
      children: [],
      nibble,
    };
    node.children.push(branchChild);
  }

  insert(branchChild, nibbles, depth + 1, key, value);
}

function computeHashes(node: PatriciaNode): string {
  if (node.type === "leaf") {
    if (node.value) {
      node.hash = hashData(node.label + node.value);
    } else {
      node.hash = "0".repeat(64);
    }
    return node.hash;
  }

  // Sort children for deterministic hashing
  node.children.sort((a, b) => {
    const aKey = a.nibble || a.label;
    const bKey = b.nibble || b.label;
    return aKey.localeCompare(bKey);
  });

  const childHashes = node.children.map((c) => computeHashes(c));
  node.hash = hashData(node.type + childHashes.join(""));
  return node.hash;
}

function getProofPath(root: PatriciaNode, targetKey: string): PatriciaNode[] {
  const path: PatriciaNode[] = [];
  const nibbles = Array.from(targetKey).flatMap((c) => {
    const hex = c.charCodeAt(0).toString(16);
    return hex.split("");
  });

  function walk(node: PatriciaNode, depth: number): boolean {
    path.push(node);
    if (node.type === "leaf") {
      return node.label === targetKey;
    }
    if (depth >= nibbles.length) {
      const leaf = node.children.find((c) => c.type === "leaf");
      return leaf ? leaf.label === targetKey : false;
    }
    const nibble = nibbles[depth];
    const child = node.children.find((c) => c.nibble === nibble || (c.type === "extension" && (c.sharedPrefix || "")[0] === nibble));
    if (child) {
      return walk(child, depth + 1);
    }
    return false;
  }

  walk(root, 0);
  return path;
}

const DEFAULT_ENTRIES = [
  { key: "a", value: "0xabcd" },
  { key: "ab", value: "0x1234" },
  { key: "abc", value: "0xdead" },
  { key: "b", value: "0xbeef" },
  { key: "bc", value: "0x4321" },
];

function PatriciaNodeView({ node, depth, proofPath, selectedKey, onSelect }: {
  node: PatriciaNode;
  depth: number;
  proofPath: Set<string>;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  const isInProof = proofPath.has(node.hash);
  const isSelected = node.type === "leaf" && node.label === selectedKey;

  const nodeColor = node.type === "leaf"
    ? isSelected
      ? "border-yellow-500 bg-yellow-500/10"
      : "border-emerald-500/50 bg-emerald-500/5"
    : node.type === "branch"
      ? isInProof
        ? "border-blue-500 bg-blue-500/10"
        : "border-violet-500/50 bg-violet-500/5"
      : "border-orange-500/50 bg-orange-500/5"; // extension

  return (
    <div className="flex flex-col items-center">
      <div
        className={`cursor-pointer rounded-md border px-2 py-1 text-xs font-mono transition-colors ${nodeColor}`}
        onClick={() => node.type === "leaf" && onSelect(node.label)}
        title={`Hash: ${node.hash.slice(0, 16)}...`}
      >
        <div className="flex items-center gap-1">
          <span className="text-[9px] uppercase text-muted-foreground">
            {node.type === "branch" ? "B" : node.type === "extension" ? "E" : "L"}
          </span>
          <span className="text-[10px]">
            {node.type === "leaf"
              ? `${node.label} = ${node.value}`
              : node.type === "extension"
                ? `prefix: ${node.sharedPrefix || ""}`
                : node.label}
          </span>
        </div>
        <div className="text-[8px] text-muted-foreground">{shortHash(node.hash)}</div>
      </div>
      {node.children.length > 0 && (
        <div className="mt-2">
          <div className="h-2 w-px bg-border" />
          <div className="flex gap-3">
            {node.children.map((child, i) => (
              <PatriciaNodeView
                key={i}
                node={child}
                depth={depth + 1}
                proofPath={proofPath}
                selectedKey={selectedKey}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PatriciaTrieExplorer() {
  const [entries, setEntries] = useState(DEFAULT_ENTRIES);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const trie = useMemo(() => buildPatriciaTrie(entries), [entries]);

  const proofPath = useMemo(() => {
    const path = new Set<string>();
    if (selectedKey) {
      getProofPath(trie, selectedKey).forEach((n) => path.add(n.hash));
    }
    return path;
  }, [trie, selectedKey]);

  const addEntry = useCallback(() => {
    if (!newKey.trim() || !newValue.trim()) return;
    setEntries((prev) => {
      const existing = prev.findIndex((e) => e.key === newKey.trim());
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { key: newKey.trim(), value: newValue.trim() };
        return updated;
      }
      return [...prev, { key: newKey.trim(), value: newValue.trim() }];
    });
    setNewKey("");
    setNewValue("");
  }, [newKey, newValue]);

  const removeEntry = useCallback((key: string) => {
    setEntries((prev) => prev.filter((e) => e.key !== key));
    if (selectedKey === key) setSelectedKey(null);
  }, [selectedKey]);

  return (
    <LLMContextLabel
      title="Patricia Trie Explorer"
      context="Interactive Patricia Merkle Trie visualizer. Add key-value pairs and see the branch/extension/leaf node structure. Click a leaf to see its proof path. The root hash updates in real-time as entries change."
      diagramType="react"
    >
      <div className="space-y-4">
        <div className="rounded-md border bg-muted/20 p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {entries.map((e) => (
              <div
                key={e.key}
                className={`rounded px-2 py-1 text-xs font-mono ${
                  selectedKey === e.key
                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                    : "bg-muted/50"
                }`}
              >
                <button onClick={() => setSelectedKey(selectedKey === e.key ? null : e.key)}>
                  {e.key} → {e.value}
                </button>
                <button
                  onClick={() => removeEntry(e.key)}
                  className="ml-1 text-destructive hover:text-destructive/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Key (e.g. abcd)"
              className="flex-1 font-mono text-xs"
            />
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              className="w-28 font-mono text-xs"
            />
            <Button variant="outline" size="sm" onClick={addEntry}>
              Add
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border bg-card p-3">
          <div className="flex justify-center">
            <PatriciaNodeView
              node={trie}
              depth={0}
              proofPath={proofPath}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border bg-muted/20 p-2 text-xs">
            <span className="font-medium">Root hash:</span>{" "}
            <code className="font-mono">{shortHash(trie.hash)}</code>
          </div>
          <div className="rounded-md border bg-muted/20 p-2 text-xs">
            <span className="font-medium">Entries:</span> {entries.length} |{" "}
            <span className="font-medium">Nodes:</span>{" "}
            {(() => {
              function count(n: PatriciaNode): number {
                return 1 + n.children.reduce((acc, c) => acc + count(c), 0);
              }
              return count(trie);
            })()}
          </div>
        </div>

        {selectedKey && (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-2 text-xs">
            <span className="font-medium">Proof for key &quot;{selectedKey}&quot;:</span>
            <ol className="ml-4 mt-1 list-decimal space-y-0.5 text-muted-foreground">
              {getProofPath(trie, selectedKey).map((n, i) => (
                <li key={i}>
                  {n.type === "branch" ? "Branch" : n.type === "extension" ? "Extension" : "Leaf"} node
                  ({n.type === "leaf" ? `${n.label} = ${n.value}` : shortHash(n.hash)})
                </li>
              ))}
              <li>Verify: reconstruct root from leaf → root</li>
            </ol>
          </div>
        )}

        <div className="rounded-md bg-muted/20 p-2 text-xs text-muted-foreground">
          <span className="font-medium">Legend:</span>{" "}
          <span className="text-violet-500">Violet</span> = Branch (16 children) |{" "}
          <span className="text-orange-500">Orange</span> = Extension (compressed prefix) |{" "}
          <span className="text-emerald-500">Green</span> = Leaf (key=value) |{" "}
          <span className="text-blue-500">Blue</span> = Proof path |{" "}
          <span className="text-yellow-500">Yellow</span> = Selected
        </div>
      </div>
    </LLMContextLabel>
  );
}