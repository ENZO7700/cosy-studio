import { S as require_jsx_runtime, m as Outlet, y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as Route$10 } from "./_ssr/router-B5PK41b5.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as AppShell } from "./_ssr/app-shell-BwQ78DL6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-lLbAOpFs.js
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		to: ".",
		label: "Overview",
		milestone: null
	},
	{
		to: "blueprint",
		label: "Blueprint",
		milestone: null
	},
	{
		to: "architecture",
		label: "Architecture",
		milestone: 4
	},
	{
		to: "canvas",
		label: "Canvas",
		milestone: 6
	},
	{
		to: "build",
		label: "Build",
		milestone: 5
	},
	{
		to: "code",
		label: "Code",
		milestone: 5
	},
	{
		to: "risks",
		label: "Risks",
		milestone: 4
	},
	{
		to: "tasks",
		label: "Tasks",
		milestone: 4
	},
	{
		to: "exports",
		label: "Exports",
		milestone: 7
	}
];
function ProjectLayout() {
	const detail = Route$10.useLoaderData();
	const { id } = Route$10.useParams();
	if (!detail) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Project",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "This project was not found."
		})
	});
	const { project } = detail;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		kicker: project.isDemo ? "Demo project" : "Project",
		title: project.name,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-xs text-muted",
			children: project.readinessScore !== null ? `Readiness ${project.readinessScore}%` : "Readiness pending"
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "-mx-1 mb-6 flex gap-1 overflow-x-auto pb-2",
				children: TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: tab.to === "." ? "/projects/$id" : `/projects/$id/${tab.to}`,
					params: { id },
					className: cn("min-h-10 shrink-0 rounded-md px-3 text-sm text-muted hover:text-fg", "[&.active]:bg-elevated [&.active]:text-fg"),
					activeOptions: { exact: tab.to === "." },
					children: [tab.label, tab.milestone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1 text-[10px] text-muted",
						children: ["M", tab.milestone]
					}) : null]
				}, tab.label))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
		})
	});
}
//#endregion
export { ProjectLayout as component };
