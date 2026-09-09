import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/milestone-state-CjMgF2nL.js
var import_jsx_runtime = require_jsx_runtime();
function MilestoneState({ milestone, feature }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-panel p-6 shadow-[0_0_0_1px_var(--color-line)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] uppercase tracking-[0.16em] text-accent",
				children: ["Scheduled for Milestone ", milestone]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-lg font-semibold",
				children: feature
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-muted",
				children: "This screen is honest empty state, not a mock. No fake build verification, live preview, or generated application lives here yet."
			})
		]
	});
}
//#endregion
export { MilestoneState as t };
