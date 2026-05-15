"use client";

import { useState } from "react";
import type { FAQSection } from "./data";

export default function FAQAccordion({
  sections,
}: {
  sections: FAQSection[];
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col gap-10">
      {sections.map((section, si) => (
        <section key={si} aria-labelledby={`faq-section-${si}`}>
          <h2
            id={`faq-section-${si}`}
            className="text-sm uppercase tracking-widest text-[var(--fg)]/50"
          >
            {section.label}
          </h2>
          <div className="mt-3 border-t border-dotted border-[var(--fg)]/20">
            {section.items.map((item, ii) => {
              const id = `faq-${si}-${ii}`;
              const isOpen = !!open[id];
              return (
                <div
                  key={id}
                  className="border-b border-dotted border-[var(--fg)]/20"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-panel`}
                    id={`${id}-trigger`}
                    onClick={() =>
                      setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
                    }
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm leading-relaxed text-[var(--fg)] hover:text-[var(--fg)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)]/40"
                  >
                    <span>{item.q}</span>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                      className={`h-4 w-4 flex-shrink-0 text-[var(--fg)]/50 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M3 6l5 5 5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <div
                      id={`${id}-panel`}
                      role="region"
                      aria-labelledby={`${id}-trigger`}
                      className="faq-answer pb-5 pr-8 text-sm leading-relaxed text-[var(--fg)]/70"
                      dangerouslySetInnerHTML={{ __html: item.a }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
