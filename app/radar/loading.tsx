/*
 * Radar loading skeleton.
 *
 * Shown by Next during the /radar server render (getRadar, requireUser,
 * profile lookups all run before first byte). Mirrors the real page shape
 * — hero → stats → filter chips → table header + 6 row skeletons — so
 * the layout does not jump when data lands.
 *
 * All motion via the shared .cts-skel shimmer defined below; no client JS.
 */

import { Shell } from "@/components/page-shell";

function Bar({ w, h = 12 }: { w: string; h?: number }) {
  return (
    <span
      className="cts-skel inline-block rounded-md"
      style={{ width: w, height: h }}
      aria-hidden="true"
    />
  );
}

export default function Loading() {
  return (
    <Shell active="Radar">
      {/* Hero */}
      <div className="rlk-hero">
        <div className="flex-1 min-w-0">
          <Bar w="120px" h={22} />
          <div className="mt-3">
            <Bar w="220px" h={34} />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Bar w="86%" h={13} />
            <Bar w="72%" h={13} />
          </div>
          <div className="mt-4 flex gap-2">
            <Bar w="110px" h={30} />
            <Bar w="110px" h={30} />
          </div>
        </div>
        <div className="cts-skel h-[180px] w-[180px] shrink-0 rounded-full max-md:hidden" aria-hidden="true" />
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Bar w="60px" h={10} />
            <Bar w="80px" h={26} />
            <Bar w="120px" h={11} />
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="mt-8 flex flex-wrap gap-2">
        {["46px", "78px", "88px", "72px", "94px", "68px", "84px"].map((w, i) => (
          <Bar key={i} w={w} h={32} />
        ))}
      </div>

      {/* Row header + skeleton rows */}
      <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
        <div className="border-b border-line bg-surface2 px-5 py-2.5">
          <Bar w="220px" h={10} />
        </div>
        <ul>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="border-b border-line last:border-b-0 px-5 py-3.5">
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <Bar w={`${55 + (i % 4) * 8}%`} h={14} />
                  <div className="mt-2 flex gap-2">
                    <Bar w="42px" h={12} />
                    <Bar w="72px" h={12} />
                  </div>
                </div>
                <Bar w="52px" h={14} />
                <Bar w="66px" h={14} />
                <Bar w="46px" h={14} />
                <Bar w="46px" h={14} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .cts-skel{background:linear-gradient(90deg,var(--c-surface-2) 0%,var(--c-line) 50%,var(--c-surface-2) 100%);background-size:200% 100%;animation:cts-skel-shine 1.4s ease-in-out infinite}
        @keyframes cts-skel-shine{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .rlk-hero{display:flex;gap:24px;align-items:center;padding:26px 28px;border-radius:20px;border:1px solid var(--c-line);background:linear-gradient(120deg,color-mix(in oklab,var(--c-accent) 4%,var(--c-surface)),var(--c-surface))}
        @media(max-width:760px){.rlk-hero{padding:22px 20px}}
        @media (prefers-reduced-motion:reduce){.cts-skel{animation:none}}
      `}</style>
    </Shell>
  );
}
