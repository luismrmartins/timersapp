import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export const metadata: Metadata = {
  title: "Privacy Policy - Timer Tempo",
  robots: "noindex",
};

const inlineLink = "underline underline-offset-2 hover:text-[var(--fg)]";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--bg)] font-mono text-[var(--fg)]">
      <main className="mx-auto w-full max-w-5xl flex-1 p-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-block">
            <Image
              src="/Tempo.png"
              alt="Timer Tempo"
              width={120}
              height={39}
              priority
              className="dark:invert dark:brightness-[1.35]"
            />
          </Link>
          <ThemeToggle />
        </div>

        <h1 className="mt-8 text-base font-normal text-[var(--fg)]">
          Privacy Policy
        </h1>

        <div className="mt-12 flex flex-col gap-10">
          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              Who we are
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              Timer Tempo is a free online timer tool available at
              timertempo.com. This is an independent project. Contact:{" "}
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
              Data we collect
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              Timer Tempo does not collect, store, or transmit any personal
              data. All timer data is stored locally in your browser using
              localStorage and never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              Advertising
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              We use Google AdSense to display ads. Google AdSense may use
              cookies to show relevant ads based on your browsing history.
              Learn more at{" "}
              <a
                href="https://policies.google.com/privacy/partners"
                className={inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                google.com/policies/privacy/partners
              </a>
              . To opt out of personalised advertising visit{" "}
              <a
                href="https://adssettings.google.com"
                className={inlineLink}
                target="_blank"
                rel="noreferrer"
              >
                adssettings.google.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              Cookies
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              Timer Tempo itself sets no cookies. Cookies on this site are set
              exclusively by Google AdSense for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              Your rights
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/70">
              Since we hold no personal data, there is nothing to access,
              correct, or delete. For data held by Google, refer to
              Google&apos;s privacy controls.
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--fg)]/50">
              Contact
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

        <footer className="mt-16">
          <div className="flex items-center justify-between border-t border-dotted border-[var(--fg)]/20 pt-6 text-xs text-[var(--fg)]/50">
            <a href="#" className="hover:text-[var(--fg)]">
              FAQ
            </a>
            <Link href="/privacy" className="hover:text-[var(--fg)]">
              Privacy
            </Link>
            <a
              href="mailto:timertempoapp@gmail.com"
              className="hover:text-[var(--fg)]"
            >
              Contact
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
