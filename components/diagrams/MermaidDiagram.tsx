"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LLMContextLabel } from "./LLMContextLabel";

// CDN URL for mermaid — loaded at runtime, never compiled by Turbopack
const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

interface MermaidDiagramProps {
  definition: string;
  title: string;
  context: string;
  className?: string;
  height?: number;
}

/**
 * Renders a Mermaid diagram definition as SVG.
 * Loads mermaid from CDN at runtime — never imported as an npm dependency,
 * so Turbopack never traces the 83MB mermaid module graph.
 *
 * The diagram is rendered client-side once the CDN script loads.
 */
export function MermaidDiagram({
  definition,
  title,
  context,
  className,
  height = 400,
}: MermaidDiagramProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`).current;

  useEffect(() => {
    let cancelled = false;

    async function loadAndRender() {
      // Wait for mermaid to be available on window
      const mermaid = await ensureMermaid();
      if (cancelled) return;

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#1e293b",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#334155",
            lineColor: "#64748b",
            secondaryColor: "#0f172a",
            tertiaryColor: "#1e293b",
            fontSize: "14px",
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
          },
          sequence: {
            showSequenceNumbers: false,
          },
        });

        const { svg } = await mermaid.render(id, definition);

        if (!cancelled && svgRef.current) {
          svgRef.current.innerHTML = svg;
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to render diagram");
          setStatus("error");
        }
      }
    }

    loadAndRender();

    return () => {
      cancelled = true;
    };
  }, [definition, id]);

  return (
    <LLMContextLabel
      title={title}
      context={context}
      diagramType="mermaid"
      mermaidDefinition={definition}
      className={className}
    >
      <div className="flex items-center justify-center">
        {status === "error" ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-medium">Diagram render error</p>
            <p className="mt-1 text-xs text-destructive/80">{error}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">Show definition</summary>
              <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                <code>{definition}</code>
              </pre>
            </details>
          </div>
        ) : (
          <div
            ref={svgRef}
            className={cn(
              "flex w-full items-center justify-center overflow-x-auto",
              status === "loading" && "min-h-[200px] animate-pulse rounded-md bg-muted",
            )}
            style={{ minHeight: status === "ready" ? height : 200 }}
          />
        )}
      </div>
    </LLMContextLabel>
  );
}

// Global promise to avoid loading the script more than once
let mermaidPromise: Promise<Mermaid> | null = null;

async function ensureMermaid(): Promise<Mermaid> {
  if (typeof window === "undefined") {
    // SSR — return a no-op
    return { initialize: () => {}, render: async () => ({ svg: "" }) } as unknown as Mermaid;
  }

  if ((window as any).mermaid) {
    return (window as any).mermaid as Mermaid;
  }

  if (!mermaidPromise) {
    mermaidPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = MERMAID_CDN;
      script.async = true;
      script.onload = () => {
        if ((window as any).mermaid) {
          resolve((window as any).mermaid as Mermaid);
        } else {
          reject(new Error("Mermaid script loaded but mermaid not found on window"));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load mermaid from CDN: ${MERMAID_CDN}`));
      document.head.appendChild(script);
    });
  }

  return mermaidPromise;
}

interface Mermaid {
  initialize: (config: Record<string, any>) => void;
  render: (id: string, definition: string) => Promise<{ svg: string }>;
}