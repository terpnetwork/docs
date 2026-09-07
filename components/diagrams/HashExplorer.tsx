"use client";

import { useState, useCallback, useMemo } from "react";
import { sha256 } from "@noble/hashes/sha2.js";
import { blake3 } from "@noble/hashes/blake3.js";
import { poseidon2 } from "poseidon-lite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LLMContextLabel } from "./LLMContextLabel";

type HashAlgorithm = "SHA-256" | "BLAKE3" | "Poseidon";

interface HashResult {
  algorithm: HashAlgorithm;
  hex: string;
  bytes: number;
  bits: number;
}

function bytesToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function computeHashes(input: string): HashResult[] {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  const shaResult = sha256(data);
  const blakeResult = blake3(data);

  // Poseidon2 operates on field elements (Fr). We hash the input's
  // byte representation split into 31-byte chunks (BN254 scalar field).
  // For an educational demo, we use a simplified approach: hash the
  // first 31 bytes of input as a single field element.
  const poseidonInput: bigint[] = [];
  for (let i = 0; i < data.length; i += 31) {
    const chunk = data.slice(i, i + 31);
    let value = 0n;
    for (let j = 0; j < chunk.length; j++) {
      value = (value << 8n) | BigInt(chunk[j]);
    }
    poseidonInput.push(value);
  }
  // Pad to at least 2 elements (Poseidon2 requires min 2)
  while (poseidonInput.length < 2) {
    poseidonInput.push(0n);
  }

  const poseidonResult = poseidon2(poseidonInput);
  // Convert BigInt to Uint8Array (32 bytes)
  const poseidonHex = poseidonResult.toString(16).padStart(64, "0");
  const poseidonBytes = new Uint8Array(32);
  for (let j = 0; j < 32; j++) {
    poseidonBytes[j] = parseInt(poseidonHex.slice(j * 2, j * 2 + 2), 16);
  }

  return [
    {
      algorithm: "SHA-256",
      hex: bytesToHex(shaResult),
      bytes: shaResult.length,
      bits: shaResult.length * 8,
    },
    {
      algorithm: "BLAKE3",
      hex: bytesToHex(blakeResult),
      bytes: blakeResult.length,
      bits: blakeResult.length * 8,
    },
    {
      algorithm: "Poseidon",
      hex: bytesToHex(poseidonBytes.slice(0, 32)),
      bytes: 32,
      bits: 256,
    },
  ];
}

function HashDisplay({
  result,
  input,
  active,
}: {
  result: HashResult;
  input: string;
  active: boolean;
}) {
  const truncated = result.hex.length > 64;
  const displayHex = result.hex.slice(0, 64) + (truncated ? "..." : "");

  return (
    <div
      className={`rounded-md border p-3 transition-colors ${
        active
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{result.algorithm}</span>
        <span className="text-xs text-muted-foreground">
          {result.bytes} B / {result.bits} bits
        </span>
      </div>
      <div className="mt-2">
        <code className="block break-all rounded bg-muted px-2 py-1 font-mono text-xs">
          {displayHex}
        </code>
      </div>
      {input && (
        <div className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium">Avalanche check:</span>{" "}
          {input.length > 0
            ? "Change one character and watch all outputs change completely"
            : "Type input above to see hashes"}
        </div>
      )}
    </div>
  );
}

const EXAMPLE_INPUTS = [
  { label: "Hello", value: "Hello" },
  { label: "Hello!", value: "Hello!" },
  { label: "Empty", value: "" },
  { label: "Long input", value: "The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog." },
];

export function HashExplorer() {
  const [input, setInput] = useState("Hello");
  const [activeAlgo, setActiveAlgo] = useState<HashAlgorithm | "all">("all");

  const results = useMemo(() => computeHashes(input), [input]);

  const handleExample = useCallback((value: string) => {
    setInput(value);
  }, []);

  const toggleAlgo = useCallback((algo: HashAlgorithm) => {
    setActiveAlgo((prev) => (prev === algo ? "all" : algo));
  }, []);

  return (
    <LLMContextLabel
      title="Interactive Hash Explorer"
      context="Side-by-side comparison of SHA-256, BLAKE3, and Poseidon hash outputs. Type any input and see real-time hash digests. Demonstrates deterministic output, fixed-size digests, and avalanche effect across the three algorithms used by Terp Network."
      diagramType="react"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type input to hash..."
            className="flex-1 font-mono"
            aria-label="Hash input"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-xs text-muted-foreground">
            Examples:
          </span>
          {EXAMPLE_INPUTS.map((ex) => (
            <Button
              key={ex.value}
              variant={input === ex.value ? "default" : "outline"}
              size="xs"
              onClick={() => handleExample(ex.value)}
            >
              {ex.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-xs text-muted-foreground">
            Filter:
          </span>
          {(["SHA-256", "BLAKE3", "Poseidon"] as const).map((algo) => (
            <Button
              key={algo}
              variant={activeAlgo === algo || activeAlgo === "all" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => toggleAlgo(algo)}
            >
              {algo}
            </Button>
          ))}
          {activeAlgo !== "all" && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setActiveAlgo("all")}
              className="text-muted-foreground"
            >
              Show all
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {results.map((result) => (
            <HashDisplay
              key={result.algorithm}
              result={result}
              input={input}
              active={activeAlgo === "all" || activeAlgo === result.algorithm}
            />
          ))}
        </div>

        <details className="rounded-md border bg-muted/20 p-3">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
            How hashes are computed
          </summary>
          <div className="mt-2 space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>SHA-256</strong> — Standard NIST hash function. Used for block headers, IBC commitments, and transaction hashing. Computed via <code>@noble/hashes/sha256</code>.
            </p>
            <p>
              <strong>BLAKE3</strong> — Fast hash function. Used for CosmWasm code hash and content-addressed storage. Computed via <code>@noble/hashes/blake3</code>.
            </p>
            <p>
              <strong>Poseidon</strong> — ZK-friendly hash function. Used for ZK circuits and Merkle proofs inside proofs. Input is split into 31-byte BN254 field elements and hashed via <code>poseidon-lite</code>.
            </p>
          </div>
        </details>
      </div>
    </LLMContextLabel>
  );
}