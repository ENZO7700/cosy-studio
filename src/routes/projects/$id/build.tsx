import { createFileRoute } from "@tanstack/react-router";
import { MilestoneState } from "@/components/projects/milestone-state";

export const Route = createFileRoute("/projects/$id/build")({
  component: () => <MilestoneState milestone={5} feature="Build verification" />,
});
