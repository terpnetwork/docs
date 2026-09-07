"use client";

import { cn } from "@/lib/utils";

interface LLMContextLabelProps {
  /** Title of the diagram — used for LLM retrieval and aria-label */
  title: string;
  /** Detailed context description — what the diagram shows, why it matters, which page it belongs to */
  context: string;
  /** The diagram content (ReactNode or Mermaid string) */
  children: React.ReactNode;
  /** Optional CSS class override */
  className?: string;
  /** Optional: set to "mermaid" when children is a Mermaid string */
  diagramType?: "mermaid" | "svg" | "react";
  /** Optional: Mermaid diagram definition string (rendered when diagramType="mermaid") */
  mermaidDefinition?: string;
}

/**
 * Wraps any diagram with a machine-readable context label for LLM-assisted
 * rendering and retrieval. The label is visible as a small caption and readable
 * by screen readers, and provides enough context for an LLM to regenerate,
 * explain, or modify the diagram.
 *
 * Usage in MDX:
 * ```tsx
 * <LLMContextLabel
 *   title="Merkle Proof Path"
 *   context="A binary Merkle tree with 4 leaves. Clicking leaf Tx2 highlights its proof path through sibling nodes Hash(Tx1) and Hash(Hash(Tx3)+Hash(Tx4)). The root hash is verified by walking the path bottom-up."
 *   diagramType="mermaid"
 *   mermaidDefinition="graph TD\n  Root-->H1[Hash A+B]\n  Root-->H2[Hash C+D]\n  H1-->A[Tx1]\n  H1-->B[Tx2]"
 * />
 * ```
 */
export function LLMContextLabel({
  title,
  context,
  children,
  className,
  diagramType = "react",
  mermaidDefinition,
}: LLMContextLabelProps) {
  const labelId = `diagram-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <figure
      id={labelId}
      className={cn(
        "my-6 rounded-lg border bg-card p-4 shadow-sm",
        className,
      )}
      aria-label={`${title}: ${context}`}
      data-llm-context={context}
      data-llm-title={title}
      data-diagram-type={diagramType}
      data-mermaid-definition={mermaidDefinition}
    >
      <figcaption className="sr-only">
        {title} — {context}
      </figcaption>
      {children}
      <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
        <span className="font-medium">{title}</span>
        <span className="ml-1 text-muted-foreground/60">—</span>
        <span className="ml-1 text-muted-foreground/70">{context}</span>
      </div>
      {mermaidDefinition && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground/50 hover:text-muted-foreground/80">
            LLM diagram definition
          </summary>
          <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
            <code>{mermaidDefinition}</code>
          </pre>
        </details>
      )}
    </figure>
  );
}