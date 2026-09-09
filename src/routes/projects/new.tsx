import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/app-shell";
import { NewProjectForm } from "@/components/projects/new-project-form";

export const Route = createFileRoute("/projects/new")({
  component: NewProjectPage,
});

function NewProjectPage() {
  return (
    <AppShell kicker="New project" title="Start a Blueprint">
      <NewProjectForm />
    </AppShell>
  );
}
