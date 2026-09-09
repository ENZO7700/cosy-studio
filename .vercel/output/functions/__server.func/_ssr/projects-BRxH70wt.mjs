import { n as SOURCE_LABELS } from "./types-CeWUKOfL.mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$11 } from "./router-B5PK41b5.mjs";
import { t as AppShell } from "./app-shell-BwQ78DL6.mjs";
import { t as Button } from "./button-DCH4ZTW6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-BRxH70wt.js
var import_jsx_runtime = require_jsx_runtime();
function StatusChip({ project }) {
	const label = project.isDemo ? "Demo" : project.status.replaceAll("_", " ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "rounded-full bg-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent",
		children: label
	});
}
function ProjectsPage() {
	const projects = Route$11.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		kicker: "Workspace",
		title: "Projects",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/projects/new",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "New project" })
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-6 max-w-2xl text-sm text-muted",
				children: "Evidence-backed rebuilds. Face metric is rebuild readiness, never clone percentage."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/projects/$id",
					params: { id: project.id },
					className: "block rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)] transition-colors hover:bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: project.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { project })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted",
							children: project.readinessScore !== null ? `Readiness ${project.readinessScore}%` : "Readiness pending"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 text-xs text-muted",
						children: [
							SOURCE_LABELS[project.sourceType],
							" · ",
							project.scope?.replaceAll("_", " ") ?? "scope unset"
						]
					})]
				}) }, project.id))
			})]
		})
	});
}
//#endregion
export { ProjectsPage as component };
