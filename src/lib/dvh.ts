/** Visual-viewport sync for 100dvh shells (keyboard + iOS chrome). */

export const APP_DVH = "--app-dvh";
export const APP_DVH_TOP = "--app-dvh-top";

export function readVisibleHeight(): number {
  if (typeof window === "undefined") return 0;
  const vv = window.visualViewport;
  const h = vv && vv.height > 0 ? vv.height : window.innerHeight;
  return Math.round(h);
}

export function readVisibleOffsetTop(): number {
  if (typeof window === "undefined") return 0;
  return Math.round(window.visualViewport?.offsetTop ?? 0);
}

export function applyAppDvh(
  root: HTMLElement = document.documentElement,
): number {
  const height = readVisibleHeight();
  const top = readVisibleOffsetTop();
  if (height > 0) root.style.setProperty(APP_DVH, `${height}px`);
  root.style.setProperty(APP_DVH_TOP, `${top}px`);
  return height;
}

export function subscribeAppDvh(
  root: HTMLElement = document.documentElement,
): () => void {
  let frame = 0;
  let lastH = -1;
  let lastTop = -1;

  const paint = () => {
    frame = 0;
    const height = readVisibleHeight();
    const top = readVisibleOffsetTop();
    if (height === lastH && top === lastTop) return;
    lastH = height;
    lastTop = top;
    if (height > 0) root.style.setProperty(APP_DVH, `${height}px`);
    root.style.setProperty(APP_DVH_TOP, `${top}px`);
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(paint);
  };

  paint();

  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule);
  vv?.addEventListener("resize", schedule);
  vv?.addEventListener("scroll", schedule);

  return () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("orientationchange", schedule);
    vv?.removeEventListener("resize", schedule);
    vv?.removeEventListener("scroll", schedule);
  };
}
