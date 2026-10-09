import { createFileRoute } from "@tanstack/react-router";
import { WallPage } from "@/components/wall/WallPage";

export const Route = createFileRoute("/")({
  component: WallPage,
});
