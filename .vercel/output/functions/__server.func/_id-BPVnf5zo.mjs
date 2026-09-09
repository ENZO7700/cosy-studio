import { n as SOURCE_LABELS } from "./_ssr/types-CeWUKOfL.mjs";
import { S as require_jsx_runtime, v as getRouteApi, y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BPVnf5zo.js
var import_jsx_runtime = require_jsx_runtime();
var projectRoute = getRouteApi("/projects/$id");
function OverviewPage() {
	const detail = projectRoute.useLoaderData();
	const { id } = projectRoute.useParams();
	if (!detail) return null;
	const { project, evidence, activity } = detail;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1.4fr_0.8fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Source and evidence"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [SOURCE_LABELS[project.sourceType], project.isDemo ? " · Labeled demo dataset" : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 font-mono text-xs text-muted",
					children: [
						"Status ",
						project.status.replaceAll("_", " "),
						" · risk ",
						project.riskLevel ?? "n/a"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-2 text-sm",
					children: evidence.slice(0, 6).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted",
							children: item.value
						})]
					}, item.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/projects/$id/blueprint",
					params: { id },
					className: "mt-5 inline-block text-sm text-accent",
					children: "Open Blueprint workspace"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-lg bg-elevated p-5 shadow-[0_0_0_1px_var(--color-line)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Activity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-3 text-sm text-muted",
				children: [activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No events yet." }) : null, activity.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-fg",
					children: event.message
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[11px]",
					children: event.actor
				})] }, event.id))]
			})]
		})]
	});
}
//#endregion
export { OverviewPage as component };
