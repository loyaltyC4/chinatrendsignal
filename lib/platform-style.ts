/**
 * Maps a source label to its coded hue. This is the namemarshal pattern: colour
 * carries the source, so a glance at the row tells you the platform. Returns CSS
 * variables so both themes resolve correctly.
 */
export function platformStyle(source: string): { fg: string; bg: string; label: string } {
  const key = source.toLowerCase();
  if (key.includes("douyin")) return { fg: "var(--c-douyin)", bg: "var(--c-douyin-weak)", label: "Douyin" };
  if (key.includes("xhs") || key.includes("xiaohong")) return { fg: "var(--c-xhs)", bg: "var(--c-xhs-weak)", label: "Xiaohongshu" };
  if (key.includes("1688")) return { fg: "var(--c-1688)", bg: "var(--c-1688-weak)", label: "1688" };
  if (key.includes("taobao")) return { fg: "var(--c-taobao)", bg: "var(--c-taobao-weak)", label: "Taobao" };
  return { fg: "var(--c-muted)", bg: "var(--c-surface-2)", label: source || "Radar" };
}
