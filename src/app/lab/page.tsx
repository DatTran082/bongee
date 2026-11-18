import type { Metadata } from "next";
import { LabBench } from "@/components/lab-bench";

export const metadata: Metadata = {
  title: "Phòng thử 3D",
  description: "Bàn thử sân khấu WebGPU của Boongee: ly giấy “giấy thật, bạc thật”.",
  // the team's test bench (docs/interactive-landing-script.md), not a page for customers: out of search and the sitemap
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <LabBench />;
}
