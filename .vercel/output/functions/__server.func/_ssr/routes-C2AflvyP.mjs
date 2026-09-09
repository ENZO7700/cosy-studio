import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as ArrowRight, n as ScanSearch } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-DCH4ZTW6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C2AflvyP.js
var import_jsx_runtime = require_jsx_runtime();
var PANELS = [
	{
		kicker: "01 Scan Site",
		title: "Evidence summary",
		rows: [
			"WordPress 6.4.3",
			"Theme: Astra Child",
			"Plugins: 23 active",
			"Content: 1,842 posts/pages",
			"Forms: 6",
			"Integrations: 3"
		]
	},
	{
		kicker: "02 Reconstruct Blueprint",
		title: "Architecture overview",
		rows: [
			"WordPress Core · Theme · Plugins",
			"Templates: 42",
			"Custom Fields: 57",
			"Taxonomies: 12",
			"Menu locations: 7"
		]
	},
	{
		kicker: "03 Detect Migration Risks",
		title: "Risk summary",
		rows: [
			"High: PHP version compatibility",
			"High: Plugin dependency risk",
			"Medium: Custom code complexity",
			"Overall: Elevated"
		]
	},
	{
		kicker: "04 Generate Cursor Plan",
		title: "Prioritized tasks",
		rows: [
			"Migrate theme and templates — 8h",
			"Rebuild custom post types — 6h",
			"Replace plugin functionality — 8h",
			"Total: 30h"
		]
	}
];
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cosy-grid min-h-dvh bg-canvas text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanSearch, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold",
					children: "COSY Studio"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/projects",
				className: "text-sm text-muted hover:text-fg",
				children: "Open workspace"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto w-full max-w-6xl px-4 pb-16 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-accent",
					children: "Blueprint Scanner"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "Powered by COSY Studio"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-fg md:text-5xl",
					children: "Website intelligence that becomes a real application workspace."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-2xl text-muted",
					children: "Scan a public website or upload a Blueprint ZIP. COSY Studio reconstructs the visible architecture, identifies migration risks, generates an implementation plan, and builds a verified application foundation."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/projects/new",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: ["Start a Blueprint", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/projects/$id",
						params: { id: "demo-iluminat" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							children: "View Demo Project"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-muted",
					children: "Public frontend intelligence. No private data extraction. No vendor lock-in."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12 grid gap-3 md:grid-cols-2",
					children: PANELS.map((panel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-[0.16em] text-accent",
								children: panel.kicker
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-sm font-semibold",
								children: panel.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-1 font-mono text-xs text-muted",
								children: panel.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: row }, row))
							})
						]
					}, panel.kicker))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-16 max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: "From website evidence to working code"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Built for serious rebuilds, not generic mockups. This slice ships foundation plus Blueprint ZIP import. Scanner, Canvas, live builds, and billing stay scheduled — and labeled as such."
					})]
				})
			]
		})]
	});
}
//#endregion
export { Home as component };
