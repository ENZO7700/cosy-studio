import { createFileRoute } from "@tanstack/react-router";
import { MilestoneState } from "@/components/projects/milestone-state";

export const Route = createFileRoute("/projects/$id/exports")({
  component: () => <MilestoneState milestone={7} feature="Exports" />,
});
