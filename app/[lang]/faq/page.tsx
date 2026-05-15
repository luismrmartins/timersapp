import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";
import { isLocale, locales } from "../../i18n/config";
import { getDictionary } from "../../i18n/dictionaries";
import FAQAccordion from "./FAQAccordion";
import { FAQ_SECTIONS, answerToPlainText } from "./data";

const inlineLink = "underline underline-offset-2 hover:text-[var(--fg)]";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const alternates = Object.fromEntries(
    locales.map((l) => [l, `/${l}/faq`]),
  );
  return {
    title: dict.meta.faqTitle,
    description: dict.faq.description,
    alternates: {
      canonical: `/${lang}/faq`,
      languages: alternates,
    },
    openGraph: {
      title: dict.meta.faqTitle,
      description: dict.faq.description,
      url: `/${lang}/faq`,
      siteName: "Timer Tempo",
      type: "website",
      locale: lang.replace("-", "_"),
    },
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.faq;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: answerToPlainText(item.a),
        },
      })),
    ),
  };

  return (
    <div className="flex flex-1 flex-col bg-[var(--bg)] font-mono text-[var(--fg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="flex w-full max-w-3xl flex-1 flex-col p-8">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/${lang}`} className="inline-block">
            <Image
              src="/Tempo.png"
              alt="Timer Tempo"
              width={92}
              height={30}
              priority
              className="dark:invert dark:brightness-[1.35]"
            />
          </Link>
          <div className="text-lg">
            <ThemeToggle />
          </div>
        </div>

        <h1 className="mt-8 text-base font-normal text-[var(--fg)]">
          {t.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
          {t.intro}{" "}
          <a href="mailto:timertempoapp@gmail.com" className={inlineLink}>
            {t.contactLink}
          </a>
        </p>

        <div className="mt-12">
          <FAQAccordion sections={FAQ_SECTIONS} />
        </div>

        <footer className="mt-auto pt-16">
          <div className="flex items-center justify-between border-t border-dotted border-[var(--fg)]/20 pt-6 text-xs text-[var(--fg)]/50">
            <Link
              href={`/${lang}/faq`}
              className="hover:text-[var(--fg)]"
            >
              {dict.footer.faq}
            </Link>
            <Link
              href={`/${lang}/privacy`}
              className="hover:text-[var(--fg)]"
            >
              {dict.footer.privacy}
            </Link>
            <a
              href="mailto:timertempoapp@gmail.com"
              className="hover:text-[var(--fg)]"
            >
              {dict.footer.contact}
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
