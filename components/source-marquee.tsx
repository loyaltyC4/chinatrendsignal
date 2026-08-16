"use client";

import { LogoMarquee, type LogoMarqueeItem } from "@/components/ui/logo-marquee";
import { PLATFORM_LOGOS } from "@/lib/platform-logos";

/**
 * The seven sources, as a single marquee.
 *
 * Bidcheck used a province and category browse grid in this slot. There is no
 * geographic dimension to this product, so the slot becomes platform coverage.
 *
 * Logos only, with no category captions underneath, and exactly one marquee on
 * the page. Plain <img> rather than next/image because a data URI needs no
 * optimisation pass and the optimiser would only add a round trip.
 */
const ITEMS: LogoMarqueeItem[] = PLATFORM_LOGOS.map((l) => ({
  id: l.id,
  label: l.label,
  mark: (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={l.src}
      alt={l.label}
      width={30}
      height={30}
      loading="lazy"
      decoding="async"
      className="h-[30px] w-[30px] object-contain opacity-55 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
    />
  ),
}));

export default function SourceMarquee() {
  return <LogoMarquee items={ITEMS} label="Platforms we index" speed={34} gap={64} />;
}
