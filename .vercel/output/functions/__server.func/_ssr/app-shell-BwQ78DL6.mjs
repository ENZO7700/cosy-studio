import { S as require_jsx_runtime, d as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as FolderKanban, i as House, n as ScanSearch, o as Ellipsis, r as Plus, s as Box } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-BwQ78DL6.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/projects",
		label: "Projects",
		icon: FolderKanban
	},
	{
		to: "/projects/new",
		label: "New",
		icon: Plus
	}
];
function AppShell({ children, title, kicker, actions }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cosy-grid min-h-dvh bg-canvas text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 hidden w-56 border-r border-line bg-panel md:flex md:flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-4 py-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanSearch, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold tracking-tight",
						children: "COSY Studio"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-muted",
						children: "Scan. Understand. Rebuild."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex flex-1 flex-col gap-1 px-3",
					children: [
						NAV.map((item) => {
							const active = item.to === "/" ? pathname === "/" : item.to === "/projects" ? pathname === "/projects" : pathname.startsWith(item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex min-h-11 items-center gap-2 rounded-md px-3 text-sm", active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
							}, item.to);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 px-3 text-[10px] uppercase tracking-[0.16em] text-muted",
							children: "Later"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-3 py-2 text-xs text-muted",
							children: "Templates, Team, Billing — Milestone 8"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:pl-56",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-line bg-panel/90 px-4 backdrop-blur-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-[0.16em] text-accent",
							children: kicker
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate text-sm font-semibold",
							children: title
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: actions
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "px-4 py-6 pb-24 md:pb-8",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-panel md:hidden",
				children: [
					{
						to: "/",
						label: "Home",
						icon: House
					},
					{
						to: "/projects",
						label: "Projects",
						icon: Box
					},
					{
						to: "/projects/new",
						label: "New",
						icon: Plus
					},
					{
						to: "/projects",
						label: "More",
						icon: Ellipsis
					}
				].map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
					}, item.label);
				})
			})
		]
	});
}
//#endregion
export { AppShell as t };
