import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-DCH4ZTW6.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-(--motion-fast,250ms) disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 min-h-11 px-4", {
	variants: { variant: {
		primary: "bg-accent text-canvas hover:bg-accent-strong",
		secondary: "bg-elevated text-fg shadow-[0_0_0_1px_var(--color-line)] hover:bg-panel",
		ghost: "text-muted hover:text-fg hover:bg-elevated",
		danger: "bg-danger text-canvas hover:opacity-90"
	} },
	defaultVariants: { variant: "primary" }
});
function Button({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Button as t };
