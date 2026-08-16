"use client";

import Image from "next/image";
import { LogoMarquee, type LogoMarqueeItem } from "@/components/ui/logo-marquee";

/**
 * The seven sources, as a single marquee.
 *
 * Bidcheck used a province/category browse grid here. There is no geographic
 * dimension to this product, so the slot becomes platform coverage instead.
 *
 * Logos only, no category captions underneath. One marquee on the page, no more.
 */
const SOURCES: Array<{ id: string; label: string; src: string }> = [
  { id: "douyin", label: "Douyin", src: "/logos/douyin.com.png" },
  { id: "xhs", label: "Xiaohongshu", src: "/logos/xiaohongshu.com.png" },
  { id: "1688", label: "1688", src: "/logos/1688.com.png" },
  { id: "taobao", label: "Taobao", src: "/logos/taobao.com.png" },
  { id: "alibaba", label: "Alibaba", src: "/logos/alibaba.com.png" },
  { id: "tiktok", label: "TikTok Shop", src: "/logos/tiktok.com.png" },
  { id: "wechat", label: "WeChat", src: "/logos/wechat.com.png" },
];

const ITEMS: LogoMarqueeItem[] = SOURCES.map((s) => ({
  id: s.id,
  label: s.label,
  mark: (
    <Image
      src={s.src}
      alt={s.label}
      width={30}
      height={30}
      className="h-[30px] w-[30px] object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
    />
  ),
}));

export default function SourceMarquee() {
  return <LogoMarquee items={ITEMS} label="Platforms we index" speed={34} gap={64} />;
}
