import { S as require_jsx_runtime, v as getRouteApi } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blueprint-QUmqACpK.js
var import_jsx_runtime = require_jsx_runtime();
var projectRoute = getRouteApi("/projects/$id");
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function BlueprintPage() {
	const detail = projectRoute.useLoaderData();
	if (!detail) return null;
	const data = asRecord(detail.blueprint?.data);
	const tokens = asRecord(data?.designTokens) ?? asRecord(data?.tokens);
	const wp = asRecord(data?.wordpress);
	const pages = Array.isArray(data?.pages) ? data.pages : [];
	const forms = Array.isArray(data?.forms) ? data.forms : [];
	const warnings = Array.isArray(data?.warnings) ? data.warnings : [];
	const limitations = Array.isArray(data?.limitations) ? data.limitations : [];
	const sourceImport = detail.imports[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1fr_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Source summary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid gap-2 text-sm md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "URL"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-mono text-xs",
								children: String(data?.finalUrl ?? data?.sourceUrl ?? "—")
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Checksum"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-mono text-xs",
								children: detail.blueprint?.contentHash ?? sourceImport?.checksum ?? "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Archive"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-mono text-xs",
								children: sourceImport?.filename ?? "seeded demo"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Validation"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: sourceImport?.validationStatus ?? "n/a" })] })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Technology and WordPress"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid gap-3 md:grid-cols-2",
							children: detail.evidence.filter((item) => [
								"technology",
								"wordpress",
								"platform",
								"theme",
								"plugins",
								"elementor"
							].includes(item.category)).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-md bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted",
										children: [
											item.category,
											" · ",
											item.state
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-sm",
										children: item.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-xs text-accent",
										children: item.value
									})
								]
							}, item.id))
						}),
						wp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-4 overflow-auto font-mono text-[11px] text-muted",
							children: JSON.stringify(wp, null, 2)
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-panel p-5 shadow-[0_0_0_1px_var(--color-line)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Pages, forms, tokens"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								pages.length,
								" page",
								pages.length === 1 ? "" : "s",
								" · ",
								forms.length,
								" form",
								forms.length === 1 ? "" : "s"
							]
						}),
						tokens ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-3 overflow-auto font-mono text-[11px] text-muted",
							children: JSON.stringify(tokens, null, 2)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "No design tokens in this Blueprint."
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-elevated p-4 shadow-[0_0_0_1px_var(--color-line)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Limitations and gaps"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm text-muted",
					children: [limitations.length === 0 && warnings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "None recorded." }) : null, [...limitations, ...warnings].map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: typeof row === "string" ? row : JSON.stringify(row) }, index))]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Evidence ledger"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2 text-xs",
					children: detail.evidence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-fg",
						children: item.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-mono text-muted",
						children: [item.state, item.confidence !== null ? ` · ${Math.round(item.confidence * 100)}%` : ""]
					})] }, item.id))
				})]
			})]
		})]
	});
}
//#endregion
export { BlueprintPage as component };
