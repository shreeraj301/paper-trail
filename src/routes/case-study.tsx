import { createFileRoute } from "@tanstack/react-router";
import { CaseStudy } from "@/components/study/CaseStudy";

export const Route = createFileRoute("/case-study")({
  component: CaseStudy,
  head: () => ({
    meta: [
      { title: "Case study · Paper Trail" },
      {
        name: "description",
        content:
          "Why Paper Trail is a wall of paper, who it is for, what shipped, and what was left out.",
      },
    ],
  }),
});
