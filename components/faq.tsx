"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Bidcheck runs two FAQ blocks ("Pricing questions" and "Questions you should
 * ask"). Merged into one here, because two accordions on one page is padding.
 *
 * Answers are deliberately concrete. Vague FAQ copy is worse than no FAQ.
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
  return (
    <Accordion type="single" collapsible className="w-full">
      {QUESTIONS.map((item, i) => (
        <AccordionItem key={i} value={`q${i}`}>
          <AccordionTrigger className="text-left text-[15px] font-medium text-ink hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="max-w-[70ch] text-[14px] leading-[1.7] text-body">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
