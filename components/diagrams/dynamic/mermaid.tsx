"use client";

import dynamic from "next/dynamic";
import { DiagramSkeleton } from "./skeleton";

export const DynamicMermaidDiagram = dynamic(
  () => import("../MermaidDiagram").then((m) => ({ default: m.MermaidDiagram })),
  { ssr: false, loading: () => <DiagramSkeleton /> },
);
