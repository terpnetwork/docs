"use client";

import { useState, useMemo } from "react";
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

interface Account {
  address: string;
  balance: string;
}

const DEFAULT_ACCOUNTS: Account[] = [
  { address: "terp1abc", balance: "1000" },
  { address: "terp1def", balance: "500" },
  { address: "terp1ghi", balance: "2000" },
  { address: "terp1jkl", balance: "750" },
];

export function SparseDenseVisualizer() {
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [newAddr, setNewAddr] = useState("");
  const [newBal, setNewBal] = useState("");

  const denseTree = useMemo(() => {
    if (accounts.length === 0) return { root: "0".repeat(64), leaves: [] };
    const size = Math.pow(2, Math.ceil(Math.log2(accounts.length)));
    const leaves: { label: string; hash: string; index: number }[] = [];
    for (let i = 0; i < size; i++) {
      if (i < accounts.length) {
        leaves.push({ label: accounts[i].address, hash: hashData(accounts[i].address + accounts[i].balance), index: i });
      } else {
        leaves.push({ label: "", hash: "0".repeat(64), index: i });
      }
    }
    // Compute root
    let level = leaves.map((l) => l.hash);
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = i + 1 < level.length ? level[i + 1] : left;
        next.push(hashData(left + right));
      }
      level = next;
    }
    return { root: level[0], leaves };
  }, [accounts]);

  const sparseTree = useMemo(() => {
    if (accounts.length === 0) return { root: "0".repeat(64), leaves: [] };
    // Sparse: each address maps to a unique position in a wider key space
    const leaves = accounts.map((a) => ({
      label: a.address,
      hash: hashData(a.address + a.balance),
      // Use first byte of address hash as position
      position: parseInt(hashData(a.address).slice(0, 2), 16) % 16,
    }));
    // Build sparse root: hash of all non-empty positions
    const allPositions = new Array(16).fill("0".repeat(64));
    for (const l of leaves) {
      allPositions[l.position] = l.hash;
    }
    let level = allPositions;
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        next.push(hashData(level[i] + (i + 1 < level.length ? level[i + 1] : level[i])));
      }
      level = next;
    }
    return { root: level[0], leaves };
  }, [accounts]);

  const addAccount = () => {
    if (!newAddr.trim() || !newBal.trim()) return;
    setAccounts((prev) => [...prev, { address: newAddr.trim(), balance: newBal.trim() }]);
    setNewAddr("");
    setNewBal("");
  };

  const removeAccount = (addr: string) => {
    setAccounts((prev) => prev.filter((a) => a.address !== addr));
  };

  return (
    <LLMContextLabel
      title="Sparse vs Dense Merkle Visualizer"
      context="Side-by-side comparison of standard (dense) Merkle tree and Jellyfish (sparse) Merkle tree representations of the same account data. Shows how sparse trees map addresses to position-based slots with default hashes for empty slots."
      diagramType="react"
    >
      <div className="space-y-4">
        <div className="rounded-md border bg-muted/20 p-3">
          <label className="mb-2 block text-xs font-medium">
            Accounts
          </label>
          <div className="mb-2 space-y-1">
            {accounts.map((a) => (
              <div key={a.address} className="flex items-center gap-2 rounded bg-background px-2 py-1 text-xs font-mono">
                <span className="flex-1">{a.address}</span>
                <span className="text-muted-foreground">{a.balance} tokens</span>
                <button
                  onClick={() => removeAccount(a.address)}
                  className="text-destructive hover:text-destructive/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newAddr}
              onChange={(e) => setNewAddr(e.target.value)}
              placeholder="Address (e.g. terp1xyz)"
              className="flex-1 font-mono text-xs"
            />
            <Input
              value={newBal}
              onChange={(e) => setNewBal(e.target.value)}
              placeholder="Balance"
              className="w-24 font-mono text-xs"
            />
            <Button variant="outline" size="sm" onClick={addAccount}>
              Add
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Dense Tree */}
          <div className="rounded-md border p-3">
            <div className="mb-2 text-sm font-semibold">Standard Merkle (Dense)</div>
            <div className="rounded bg-muted/30 p-2">
              <div className="mb-1 text-[10px] text-muted-foreground">Leaves (packed):</div>
              <div className="flex flex-wrap gap-1">
                {denseTree.leaves.map((l, i) => (
                  <div
                    key={i}
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                      l.label ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/50 text-muted-foreground/50"
                    }`}
                    title={l.label ? `${l.label}: ${shortHash(l.hash)}` : "Empty slot"}
                  >
                    {l.label ? shortHash(l.hash) : "∅"}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                Root: {shortHash(denseTree.root)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Size: {denseTree.leaves.length} slots ({accounts.length} filled, {denseTree.leaves.length - accounts.length} empty)
              </div>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              <span className="font-medium">Proof for {accounts[0]?.address || "N/A"}:</span>{" "}
              O(log n) sibling hashes from packed leaves
            </div>
          </div>

          {/* Sparse Tree */}
          <div className="rounded-md border p-3">
            <div className="mb-2 text-sm font-semibold">Jellyfish (Sparse)</div>
            <div className="rounded bg-muted/30 p-2">
              <div className="mb-1 text-[10px] text-muted-foreground">Position-based slots (0-15):</div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 16 }, (_, i) => {
                  const leaf = sparseTree.leaves.find((l) => l.position === i);
                  return (
                    <div
                      key={i}
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                        leaf
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted/50 text-muted-foreground/50"
                      }`}
                      title={leaf ? `${leaf.label} → pos ${i}` : `Empty slot ${i}`}
                    >
                      {leaf ? shortHash(leaf.hash) : "∅"}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                Root: {shortHash(sparseTree.root)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Size: 16 slots ({accounts.length} filled, {16 - accounts.length} default)
              </div>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              <span className="font-medium">Proof for {accounts[0]?.address || "N/A"}:</span>{" "}
              O(log N) — path through 4 levels, default hashes fill empty siblings
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-muted/20 p-2 text-xs text-muted-foreground">
          <span className="font-medium">Key difference:</span> Sparse trees map each address to a fixed position. Empty slots use a default hash. Proof paths are shorter and more predictable than dense trees, especially for ZK circuits.
        </div>
      </div>
    </LLMContextLabel>
  );
}