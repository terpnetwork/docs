"use client";

import dynamic from "next/dynamic";
import { DiagramSkeleton } from "./skeleton";

export const DynamicSparseDenseVisualizer = dynamic(
  () =>
    import("../SparseDenseVisualizer").then((m) => ({
      default: m.SparseDenseVisualizer,
    })),
  { ssr: false, loading: () => <DiagramSkeleton /> },
);
