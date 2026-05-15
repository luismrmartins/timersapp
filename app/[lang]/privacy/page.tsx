import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";
import { isLocale } from "../../i18n/config";
import { getDictionary } from "../../i18n/dictionaries";

const inlineLink = "underline underline-offset-2 hover:text-[var(--fg)]";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.privacyTitle,
    robots: "noindex",
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.privacy;

  return (
    <div className="flex flex-1 flex-col bg-[var(--bg)] font-mono text-[var(--fg)]">
      <main className="flex w-full max-w-5xl flex-1 flex-col p-8">
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

        <div className="mt-12 flex flex-col gap-10">
          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              {t.whoWeAre}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              {t.whoWeAreBody}
              <a
                href="mailto:timertempoapp@gmail.com"
                className={inlineLink}
              >
                timertempoapp@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              {t.dataWeCollect}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              {t.dataWeCollectBody}
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              {t.advertising}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              {t.advertisingBody1}
              <a
                href="https://policies.google.com/privacy/partners"
                className={inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                google.com/policies/privacy/partners
              </a>
              {t.advertisingBody2}
              <a
                href="https://adssettings.google.com"
                className={inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                adssettings.google.com
              </a>
              {t.advertisingBody3}
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              {t.cookies}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              {t.cookiesBody}
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              {dict.privacy.yourRights}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              {t.yourRightsBody}
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              {t.contact}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              <a
                href="mailto:timertempoapp@gmail.com"
                className={inlineLink}
              >
                timertempoapp@gmail.com
              </a>
            </p>
          </section>
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
