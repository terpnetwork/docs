"use client";

import dynamic from "next/dynamic";
import { DiagramSkeleton } from "./skeleton";

export const DynamicMMRGrowthSimulator = dynamic(
  () =>
    import("../MMRGrowthSimulator").then((m) => ({
      default: m.MMRGrowthSimulator,
    })),
  { ssr: false, loading: () => <DiagramSkeleton /> },
);
