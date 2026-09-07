"use client";

import dynamic from "next/dynamic";
import { DiagramSkeleton } from "./skeleton";

export const DynamicHashExplorer = dynamic(
  () => import("../HashExplorer").then((m) => ({ default: m.HashExplorer })),
  { ssr: false, loading: () => <DiagramSkeleton /> },
);
