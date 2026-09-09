import { createFileRoute } from "@tanstack/react-router";
import { MilestoneState } from "@/components/projects/milestone-state";

export const Route = createFileRoute("/projects/$id/tasks")({
  component: () => <MilestoneState milestone={4} feature="Cursor task plan" />,
});
