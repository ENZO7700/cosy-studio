import { createFileRoute } from "@tanstack/react-router";
import { MilestoneState } from "@/components/projects/milestone-state";

export const Route = createFileRoute("/projects/$id/canvas")({
  component: () => <MilestoneState milestone={6} feature="COSY Canvas" />,
});
