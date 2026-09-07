"use client";

import dynamic from "next/dynamic";
import { DiagramSkeleton } from "./skeleton";

export const DynamicPatriciaTrieExplorer = dynamic(
  () =>
    import("../PatriciaTrieExplorer").then((m) => ({
      default: m.PatriciaTrieExplorer,
    })),
  { ssr: false, loading: () => <DiagramSkeleton /> },
);
