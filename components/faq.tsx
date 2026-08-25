"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { useState } from "react";

/*
 * FAQ — interactive accordion. Pattern adapted from 21st.dev's
 * "Interactive Accordion" (jatin-yadav05, id 9602): numbered items,
 * plus-icon that rotates 45° into an X on open, progressive underline
 * on hover, spring-eased height transition.
 *
 * Built on the existing @radix-ui/react-accordion dep (already installed)
 * for keyboard nav and a11y, styled against CTS design tokens (Geist,
 * electric-blue accent, --c-line borders).
 *
 * Answers were already concrete in the previous implementation — kept
 * as-is. Only the presentation is new.
 */

const QUESTIONS: Array<{ q: string; a: string }> = [
  {
    q: "How far ahead of TikTok Shop are you, really?",
    a: "It depends on the product, and we do not publish an average because averages here are marketing. What we do instead is stamp every signal with the date we first recorded it and never change that date. You can check the gap yourself on any row.",
  },
  {
    q: "Do you estimate store revenue?",
    a: "No. Tools in this category are widely distrusted for inventing revenue figures, and one seller reported a competitor showing $200k against a store that had not cleared $1k. We show engagement read from the platform, we label anything we inferred, and we show a dash where we have no data.",
  },
  {
    q: "What is the saves-to-likes number?",
    a: "On Xiaohongshu a like is cheap and a save is not. Saving a post means bookmarking it to buy later, so the ratio of saves to likes is the closest public proxy for purchase intent. Anything above roughly 0.7 is unusual and worth a look.",
  },
  {
    q: "Where does the supplier price come from?",
    a: "We search 1688 wholesale listings for the extracted product term and take the median offer rather than the cheapest, because the cheapest listing is usually bait. The resulting spread is marked as estimated, because it is inferred from wholesale pricing and not measured from real sales.",
  },
  {
    q: "Do credits expire?",
    a: "Never. Buy them now and use them next year. If our data layer goes down for a week your balance is untouched and still there when it comes back. Reading the radar is flat-rate and costs no credits at all.",
  },
  {
    q: "Can I cancel easily?",
    a: "Yes, self-serve from the billing portal, effective immediately. No retention maze, no support ticket required, and no charge after you cancel.",
  },
  {
    q: "What happens on the free tier?",
    a: "You get the weekly email, a seven-day-delayed top ten, and five product lookups a month. It does not expire and it never asks for a card. It is genuinely useful on its own, just slower than paid.",
  },
];

export default function Faq() {
  const [openValue, setOpenValue] = useState<string>("q0");

  return (
    <div className="faq-i">
      <Accordion.Root
        type="single"
        collapsible
        value={openValue}
        onValueChange={(v) => setOpenValue(v)}
        className="faq-i-list"
      >
        {QUESTIONS.map((item, i) => {
          const num = String(i + 1).padStart(2, "0");
          const value = `q${i}`;
          return (
            <Accordion.Item key={value} value={value} className="faq-i-item">
              <Accordion.Header asChild>
                <h3 className="faq-i-h">
                  <Accordion.Trigger className="faq-i-trigger">
                    <span className="faq-i-num" aria-hidden="true">{num}</span>
                    <span className="faq-i-q">{item.q}</span>
                    <span className="faq-i-plus" aria-hidden="true">
                      <span className="faq-i-plus-h" />
                      <span className="faq-i-plus-v" />
                    </span>
                  </Accordion.Trigger>
                </h3>
              </Accordion.Header>
              <Accordion.Content className="faq-i-content">
                <div className="faq-i-a">{item.a}</div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>

      <style>{`
        .faq-i-list{display:flex;flex-direction:column;width:100%}
        .faq-i-item{border-top:1px solid var(--c-line);transition:border-color .3s}
        .faq-i-item:last-child{border-bottom:1px solid var(--c-line)}
        .faq-i-item[data-state="open"]{border-top-color:color-mix(in oklab,var(--c-accent) 30%,transparent)}
        .faq-i-item[data-state="open"]+.faq-i-item{border-top-color:color-mix(in oklab,var(--c-accent) 30%,transparent)}

        .faq-i-h{margin:0}
        .faq-i-trigger{
          all:unset;box-sizing:border-box;cursor:pointer;
          width:100%;display:grid;grid-template-columns:52px 1fr 32px;gap:14px;
          align-items:center;padding:22px 4px;
          font-family:var(--font-geist-sans);
          color:var(--c-ink);
          transition:padding .3s cubic-bezier(.22,1,.36,1);
        }
        .faq-i-trigger:focus-visible{outline:2px solid var(--c-accent);outline-offset:4px;border-radius:8px}

        .faq-i-num{
          font-family:var(--font-mono);font-size:.7rem;font-weight:700;
          letter-spacing:.08em;color:var(--c-muted);
          transition:color .3s;
        }
        .faq-i-item[data-state="open"] .faq-i-num{color:var(--c-accent)}

        .faq-i-q{
          font-weight:600;font-size:1rem;line-height:1.35;
          letter-spacing:-.005em;color:var(--c-ink);
          position:relative;padding-right:12px;
          background-image:linear-gradient(var(--c-accent),var(--c-accent));
          background-repeat:no-repeat;
          background-position:0 100%;
          background-size:0% 1.5px;
          transition:background-size .35s cubic-bezier(.22,1,.36,1);
        }
        .faq-i-trigger:hover .faq-i-q{background-size:100% 1.5px}
        .faq-i-item[data-state="open"] .faq-i-q{background-size:100% 1.5px}

        /* plus-to-X icon */
        .faq-i-plus{
          position:relative;width:22px;height:22px;flex-shrink:0;justify-self:end;
          border-radius:50%;
          transition:background .3s,transform .35s cubic-bezier(.34,1.56,.64,1);
        }
        .faq-i-plus-h,.faq-i-plus-v{
          position:absolute;left:50%;top:50%;background:var(--c-ink);
          border-radius:2px;transition:transform .35s cubic-bezier(.22,1,.36,1),background .3s;
        }
        .faq-i-plus-h{width:12px;height:1.5px;transform:translate(-50%,-50%)}
        .faq-i-plus-v{width:1.5px;height:12px;transform:translate(-50%,-50%)}
        .faq-i-trigger:hover .faq-i-plus{background:var(--c-surface-2)}
        .faq-i-item[data-state="open"] .faq-i-plus{transform:rotate(180deg);background:var(--c-accent)}
        .faq-i-item[data-state="open"] .faq-i-plus-h,
        .faq-i-item[data-state="open"] .faq-i-plus-v{background:#fff}
        .faq-i-item[data-state="open"] .faq-i-plus-v{transform:translate(-50%,-50%) rotate(90deg)}

        /* Content collapse animation using Radix content-height CSS var */
        .faq-i-content{overflow:hidden}
        .faq-i-content[data-state="open"]{animation:faq-i-down .38s cubic-bezier(.22,1,.36,1)}
        .faq-i-content[data-state="closed"]{animation:faq-i-up .28s cubic-bezier(.4,0,1,1)}
        @keyframes faq-i-down{from{height:0;opacity:0}to{height:var(--radix-accordion-content-height);opacity:1}}
        @keyframes faq-i-up{from{height:var(--radix-accordion-content-height);opacity:1}to{height:0;opacity:0}}

        .faq-i-a{
          padding:0 4px 24px 66px;
          max-width:70ch;
          font-size:.95rem;line-height:1.65;
          color:var(--c-muted);
        }
        @media(max-width:520px){
          .faq-i-trigger{grid-template-columns:36px 1fr 24px;gap:10px;padding:18px 2px}
          .faq-i-num{font-size:.6rem}
          .faq-i-q{font-size:.94rem}
          .faq-i-a{padding-left:46px}
        }
        @media (prefers-reduced-motion:reduce){
          .faq-i-content[data-state="open"],.faq-i-content[data-state="closed"]{animation:none}
          .faq-i-content[data-state="open"]{height:var(--radix-accordion-content-height)}
          .faq-i-content[data-state="closed"]{height:0}
        }
      `}</style>
    </div>
  );
}
