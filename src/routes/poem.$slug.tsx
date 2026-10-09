import { createFileRoute, notFound } from "@tanstack/react-router";
import { WallPage } from "@/components/wall/WallPage";
import { getPoemBySlug } from "@/data/poems";

export const Route = createFileRoute("/poem/$slug")({
  beforeLoad: ({ params }) => {
    const poem = getPoemBySlug(params.slug);
    if (!poem) throw notFound();
  },
  head: ({ params }) => {
    const poem = getPoemBySlug(params.slug);
    return {
      meta: [
        { title: poem ? `${poem.title} · Paper Trail` : "Paper Trail" },
        {
          name: "description",
          content: poem?.excerpt ?? "A poem on Paper Trail.",
        },
      ],
    };
  },
  component: WallPage,
});
