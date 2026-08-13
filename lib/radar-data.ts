import type { Signal } from "@/components/signal-feed";

// Shared radar dataset used by the feed, the analyst and the reports.
// This is the canonical shape; the nightly JustOne cron will replace this with live rows.
export const SIGNALS: Signal[] = [
  { id: "1", product: "Steam-spray pet brush", zh: "喷雾梳", niche: "Pet care", stage: "Rising", velocityPct: 214, intent: 88, wholesaleCny: 2.52, retailAud: 39.95, sources: ["XHS", "1688", "Douyin"], refreshed: "4h" },
  { id: "2", product: "Portable neck fan (USB-C)", zh: "挂脖风扇", niche: "Summer/Cooling", stage: "Rising", velocityPct: 186, intent: 81, wholesaleCny: 8.9, retailAud: 34.95, sources: ["Douyin", "1688"], refreshed: "4h" },
  { id: "3", product: "Glass skin essence mist", zh: "精华喷雾", niche: "K-Beauty", stage: "Rising", velocityPct: 149, intent: 84, wholesaleCny: 6.4, retailAud: 29.95, sources: ["XHS", "TikTok"], refreshed: "6h" },
  { id: "4", product: "Magnetic cable clips (12pk)", zh: "磁吸理线器", niche: "Desk/Home org", stage: "Rising", velocityPct: 121, intent: 72, wholesaleCny: 1.8, retailAud: 14.95, sources: ["1688", "Douyin"], refreshed: "6h" },
  { id: "5", product: "Electric callus remover", zh: "电动磨脚器", niche: "Beauty tools", stage: "Peaking", velocityPct: 96, intent: 77, wholesaleCny: 11.2, retailAud: 44.95, sources: ["XHS", "Taobao"], refreshed: "8h" },
  { id: "6", product: "Snack-box sampler (Asian)", zh: "零食大礼包", niche: "Food/Snacks", stage: "Rising", velocityPct: 88, intent: 69, wholesaleCny: 14.5, retailAud: 49.0, sources: ["Douyin", "XHS"], refreshed: "8h" },
  { id: "7", product: "Acupressure neck pillow", zh: "颈椎按摩枕", niche: "Wellness", stage: "Peaking", velocityPct: 64, intent: 71, wholesaleCny: 9.7, retailAud: 39.95, sources: ["Taobao", "1688"], refreshed: "12h" },
  { id: "8", product: "UV phone sanitizer box", zh: "手机消毒盒", niche: "Tech/Gadgets", stage: "Fading", velocityPct: 22, intent: 41, wholesaleCny: 7.3, retailAud: 24.95, sources: ["1688"], refreshed: "12h" },
  { id: "9", product: "Heatless curls kit", zh: "无热卷发棒", niche: "Hair care", stage: "Fading", velocityPct: 12, intent: 38, wholesaleCny: 4.1, retailAud: 19.95, sources: ["XHS"], refreshed: "1d" },
];
