import { o as __toESM } from "../_runtime.mjs";
import { n as SOURCE_LABELS, r as TARGET_LABELS, t as SCOPE_LABELS } from "./types-CeWUKOfL.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as importZipProject, i as createIdeaProject, o as sampleZip } from "./router-B5PK41b5.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as AppShell } from "./app-shell-BwQ78DL6.mjs";
import { t as Button } from "./button-DCH4ZTW6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-_xNYfcS2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = String(reader.result ?? "");
			const comma = result.indexOf(",");
			resolve(comma >= 0 ? result.slice(comma + 1) : result);
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}
var STEPS = [
	"Source",
	"Details",
	"Target",
	"Scope",
	"Confirm"
];
function NewProjectForm() {
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)(0);
	const [source, setSource] = (0, import_react.useState)("blueprint_zip");
	const [name, setName] = (0, import_react.useState)("Agency rebuild");
	const [idea, setIdea] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const [target, setTarget] = (0, import_react.useState)("next_ts_tailwind");
	const [scope, setScope] = (0, import_react.useState)("frontend_rebuild");
	const [authorized, setAuthorized] = (0, import_react.useState)(false);
	const [errors, setErrors] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const sourceBlocked = source === "url" ? "Public URL scanning is scheduled for Milestone 3." : null;
	const appZipNote = source === "app_zip" ? "Existing app ZIP import (no execution) lands with the builder in Milestone 5. Use a Blueprint ZIP now." : null;
	async function downloadSample() {
		const sample = await sampleZip();
		const bytes = Uint8Array.from(atob(sample.base64), (c) => c.charCodeAt(0));
		const blob = new Blob([bytes], { type: "application/zip" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = sample.filename;
		a.click();
		URL.revokeObjectURL(url);
	}
	async function submit() {
		setErrors([]);
		setBusy(true);
		try {
			if (source === "blank") {
				const result = await createIdeaProject({ data: {
					name,
					ideaBrief: idea,
					targetStack: target,
					scope,
					authorized
				} });
				if (!result.ok) {
					setErrors(result.errors);
					return;
				}
				await navigate({
					to: "/projects/$id",
					params: { id: result.id }
				});
				return;
			}
			if (source !== "blueprint_zip") {
				setErrors([sourceBlocked ?? appZipNote ?? "This source is not available in Milestone 2."]);
				return;
			}
			if (!file) {
				setErrors(["Drop a .zip file first."]);
				return;
			}
			const zipBase64 = await fileToBase64(file);
			const result = await importZipProject({ data: {
				name,
				filename: file.name,
				zipBase64,
				targetStack: target,
				scope,
				authorized
			} });
			if (!result.ok) {
				setErrors(result.errors);
				return;
			}
			await navigate({
				to: "/projects/$id/blueprint",
				params: { id: result.id }
			});
		} catch (error) {
			setErrors([error instanceof Error ? error.message : "Import failed."]);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mb-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-muted",
				children: STEPS.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn(index === step && "text-accent"),
					children: [
						String(index + 1).padStart(2, "0"),
						" ",
						label
					]
				}, label))
			}),
			step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [
					Object.keys(SOURCE_LABELS).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSource(key),
						className: cn("min-h-14 rounded-lg bg-panel px-4 text-left text-sm shadow-[0_0_0_1px_var(--color-line)]", source === key && "bg-elevated text-fg"),
						children: SOURCE_LABELS[key]
					}, key)),
					sourceBlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-warning",
						children: sourceBlocked
					}) : null,
					appZipNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-warning",
						children: appZipNote
					}) : null
				]
			}),
			step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: ["Project name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							onChange: (event) => setName(event.target.value),
							className: "mt-2 min-h-11 w-full rounded-md bg-elevated px-3 text-fg shadow-[0_0_0_1px_var(--color-line)]"
						})]
					}),
					source === "blueprint_zip" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: "Blueprint ZIP"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Expects blueprint.json, manifest.json, index.html. Optional css/, assets/, pages.json. Archives are never executed."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".zip,application/zip",
							className: "mt-3 block w-full text-sm",
							onChange: (event) => setFile(event.target.files?.[0] ?? null)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-3 text-sm text-accent",
							onClick: () => void downloadSample(),
							children: "Download a valid sample ZIP"
						})
					] }),
					source === "blank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: ["Project goal", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: idea,
							onChange: (event) => setIdea(event.target.value),
							rows: 5,
							className: "mt-2 w-full rounded-md bg-elevated p-3 text-fg shadow-[0_0_0_1px_var(--color-line)]",
							placeholder: "Who it is for, core features, preferred stack."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-start gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: authorized,
							onChange: (event) => setAuthorized(event.target.checked),
							className: "mt-1 size-4"
						}), "I confirm I am authorized to upload this public site evidence or archive."]
					})
				]
			}),
			step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: Object.keys(TARGET_LABELS).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTarget(key),
					className: cn("min-h-12 rounded-lg bg-panel px-4 text-left text-sm shadow-[0_0_0_1px_var(--color-line)]", target === key && "bg-elevated"),
					children: TARGET_LABELS[key]
				}, key))
			}),
			step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: Object.keys(SCOPE_LABELS).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setScope(key),
					className: cn("min-h-12 rounded-lg bg-panel px-4 text-left text-sm shadow-[0_0_0_1px_var(--color-line)]", scope === key && "bg-elevated"),
					children: SCOPE_LABELS[key]
				}, key))
			}),
			step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-lg bg-panel p-4 shadow-[0_0_0_1px_var(--color-line)] text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Name"
						}),
						" ",
						name
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Source"
						}),
						" ",
						SOURCE_LABELS[source]
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Target"
						}),
						" ",
						TARGET_LABELS[target]
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Scope"
						}),
						" ",
						SCOPE_LABELS[scope]
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Authorized"
						}),
						" ",
						authorized ? "Yes" : "No"
					] }),
					file ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted",
						children: [
							file.name,
							" · ",
							file.size,
							" bytes"
						]
					}) : null
				]
			}),
			errors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-1 text-sm text-danger",
				children: errors.map((error) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: error }, error))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-3",
				children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					onClick: () => setStep((value) => value - 1),
					children: "Back"
				}) : null, step < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => setStep((value) => value + 1),
					children: "Continue"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: busy,
					onClick: () => void submit(),
					children: busy ? "Creating…" : "Create project"
				})]
			})
		]
	});
}
function NewProjectPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		kicker: "New project",
		title: "Start a Blueprint",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewProjectForm, {})
	});
}
//#endregion
export { NewProjectPage as component };
