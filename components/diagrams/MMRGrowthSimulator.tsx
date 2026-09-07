"use client";

import { useState, useMemo, useCallback } from "react";
import { sha256 } from "@noble/hashes/sha2.js";
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

interface Mountain {
  size: number; // power of 2
  hash: string;
  leaves: string[];
}

function buildMmr(leaves: string[]): { mountains: Mountain[]; peaks: string[]; root: string } {
  const mountains: Mountain[] = [];

  for (const leaf of leaves) {
    mountains.push({ size: 1, hash: hashData(leaf), leaves: [leaf] });

    // Merge like binary addition
    while (mountains.length >= 2 && mountains[mountains.length - 1].size === mountains[mountains.length - 2].size) {
      const right = mountains.pop()!;
      const left = mountains.pop()!;
      const mergedLeaves = [...left.leaves, ...right.leaves];
      mountains.push({
        size: left.size * 2,
        hash: hashData(left.hash + right.hash),
        leaves: mergedLeaves,
      });
    }
  }

  const peaks = mountains.map((m) => m.hash);
  const root = peaks.length > 0 ? hashData(peaks.join("")) : "0".repeat(64);

  return { mountains, peaks, root };
}

export function MMRGrowthSimulator() {
  const [leafCount, setLeafCount] = useState(7);
  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null);

  const leaves = useMemo(
    () => Array.from({ length: leafCount }, (_, i) => `Leaf ${i + 1}`),
    [leafCount],
  );

  const mmr = useMemo(() => buildMmr(leaves), [leaves]);

  const addLeaf = useCallback(() => {
    setLeafCount((prev) => Math.min(prev + 1, 20));
  }, []);

  const removeLeaf = useCallback(() => {
    setLeafCount((prev) => Math.max(prev - 1, 1));
  }, []);

  const reset = useCallback(() => {
    setLeafCount(0);
    setSelectedLeaf(null);
  }, []);

  return (
    <LLMContextLabel
      title="MMR Growth Simulator"
      context="Interactive Merkle Mountain Range visualizer. Shows how mountains merge like binary addition as new leaves are appended. Each leaf is a 1-leaf mountain; two mountains of the same size merge into a larger one. Click a leaf to see its position in the structure."
      diagramType="react"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={removeLeaf} disabled={leafCount <= 0}>
            − Remove
          </Button>
          <Button variant="outline" size="sm" onClick={addLeaf} disabled={leafCount >= 20}>
            + Add Leaf
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {leafCount} leaf{leafCount !== 1 ? "ren" : ""}
          </span>
        </div>

        <div className="rounded-md border bg-card p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Mountains ({mmr.mountains.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {mmr.mountains.map((m, i) => (
              <div
                key={i}
                className="rounded border bg-muted/20 p-2"
                style={{
                  borderLeft: `3px solid hsl(${i * 60}, 60%, 50%)`,
                }}
              >
                <div className="text-[10px] font-mono text-muted-foreground">
                  {shortHash(m.hash)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Size: {m.size} leaf{m.size !== 1 ? "ren" : ""}
                </div>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {m.leaves.map((l, j) => {
                    const globalIndex = mmr.mountains
                      .slice(0, i)
                      .reduce((acc, m) => acc + m.leaves.length, 0) + j;
                    const isSelected = selectedLeaf === globalIndex;
                    return (
                      <button
                        key={j}
                        onClick={() => setSelectedLeaf(isSelected ? null : globalIndex)}
                        className={`rounded px-1 py-0.5 font-mono text-[9px] transition-colors ${
                          isSelected
                            ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                            : "bg-muted/50 hover:bg-muted/80"
                        }`}
                      >
                        L{globalIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {mmr.mountains.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No leaves. Click "Add Leaf" to start building.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="text-xs font-medium">Peaks</div>
            <div className="mt-1 space-y-0.5">
              {mmr.peaks.map((p, i) => (
                <div key={i} className="font-mono text-[10px] text-muted-foreground">
                  Peak {i + 1}: {shortHash(p)}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="text-xs font-medium">Root</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              hash({mmr.peaks.length} peak{mmr.peaks.length !== 1 ? "s" : ""}) = {shortHash(mmr.root)}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              The root uniquely commits to all {leafCount} leaf{leafCount !== 1 ? "ren" : ""}
            </div>
          </div>
        </div>

        {selectedLeaf !== null && (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-2 text-xs">
            <span className="font-medium">Selected: Leaf {selectedLeaf + 1}</span>
            <span className="ml-2 text-muted-foreground">
              (found in mountain at position{" "}
              {mmr.mountains.findIndex((m) => {
                let offset = 0;
                for (const m2 of mmr.mountains) {
                  if (offset + m2.leaves.length > selectedLeaf) return true;
                  offset += m2.leaves.length;
                }
                return false;
              }) + 1}
              )
            </span>
          </div>
        )}

        <div className="rounded-md bg-muted/20 p-2 text-xs text-muted-foreground">
          <span className="font-medium">Binary carry behavior:</span>{" "}
          Each new leaf starts as a 1-leaf mountain. Two mountains of equal size merge into one of double size — just like binary addition carrying over.
        </div>
      </div>
    </LLMContextLabel>
  );
}