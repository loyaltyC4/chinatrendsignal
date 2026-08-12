"use client";
import React from "react";
import ParticleSphereAnimation from "@/components/ui/orbiting-circles-02-utils/particlesphere";

const orbits = [
  {
    size: "w-64 h-64 md:w-[26rem] md:h-[26rem]",
    duration: 18,
    icons: [
      { src: "/logos/douyin.com.png", alt: "Douyin", angle: -60 },
      { src: "/logos/xiaohongshu.com.png", alt: "Xiaohongshu", angle: 0 },
    ],
  },
  {
    size: "w-88 h-88 md:w-[36rem] md:h-[36rem]",
    duration: 26,
    icons: [
      { src: "/logos/taobao.com.png", alt: "Taobao", angle: 0 },
      { src: "/logos/wechat.com.png", alt: "WeChat", angle: -90 },
    ],
  },
  {
    size: "w-[26rem] h-[26rem] md:w-[46rem] md:h-[46rem]",
    duration: 34,
    icons: [
      { src: "/logos/1688.com.png", alt: "1688", angle: -60 },
      { src: "/logos/tiktok.com.png", alt: "TikTok", angle: 0 },
      { src: "/logos/alibaba.com.png", alt: "Xingtu / Alibaba", angle: 60 },
    ],
  },
];

export default function OrbitingCirclesGlobe({ dark = true }: { dark?: boolean }) {
  const ring = dark ? "border-white/10" : "border-black/15";
  return (
    <div className="relative w-full h-[22rem] md:h-[34rem] overflow-hidden flex justify-center">
      <style>{`
        @keyframes orbit-cw { from { transform: rotate(var(--start-angle)) } to { transform: rotate(calc(var(--start-angle) + 360deg)) } }
        @keyframes orbit-ccw { from { transform: rotate(var(--start-angle)) } to { transform: rotate(calc(var(--start-angle) - 360deg)) } }
        @keyframes counter-cw { from { transform: rotate(var(--counter-offset, 0deg)) } to { transform: rotate(calc(var(--counter-offset, 0deg) - 360deg)) } }
        @keyframes counter-ccw { from { transform: rotate(var(--counter-offset, 0deg)) } to { transform: rotate(calc(var(--counter-offset, 0deg) + 360deg)) } }
      `}</style>
      {/* Center particle globe */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 aspect-square pointer-events-none w-64 md:w-[36rem] z-10">
        <ParticleSphereAnimation dark={dark} />
      </div>
      {/* Orbiting rings */}
      {orbits.map((orbit, index) => {
        const isCW = index % 2 === 0;
        const orbitAnim = isCW ? "orbit-cw" : "orbit-ccw";
        const counterAnim = isCW ? "counter-cw" : "counter-ccw";
        const allIcons = [
          ...orbit.icons,
          ...orbit.icons.map((ic) => ({ ...ic, angle: ic.angle + 180, alt: `${ic.alt}-mirror` })),
        ];
        return (
          <div
            key={index}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border ${ring} ${orbit.size}`}
          >
            {allIcons.map((iconData, iconIndex) => (
              <div
                key={iconIndex}
                className="absolute top-0 left-1/2 h-1/2 -ml-8 origin-bottom flex flex-col justify-start items-center"
                style={{
                  "--start-angle": `${iconData.angle}deg`,
                  animation: `${orbitAnim} ${orbit.duration}s linear infinite`,
                } as React.CSSProperties}
              >
                <div
                  className="p-2.5 sm:p-3.5 border border-white/10 rounded-full bg-white -mt-8 relative z-10 shadow-lg"
                  style={{
                    "--counter-offset": `${-iconData.angle}deg`,
                    animation: `${counterAnim} ${orbit.duration}s linear infinite`,
                  } as React.CSSProperties}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={iconData.src} alt={iconData.alt} width={32} height={32} className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
