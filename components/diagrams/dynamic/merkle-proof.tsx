"use client";

import dynamic from "next/dynamic";
import { DiagramSkeleton } from "./skeleton";

export const DynamicMerkleProofVisualizer = dynamic(
  () =>
    import("../MerkleProofVisualizer").then((m) => ({
      default: m.MerkleProofVisualizer,
    })),
  { ssr: false, loading: () => <DiagramSkeleton /> },
);
