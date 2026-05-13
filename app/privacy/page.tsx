import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Timer Tempo",
  robots: "noindex",
};

const inlineLink =
  "underline underline-offset-2 hover:text-[#111111]";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#FAFAF8] font-mono text-[#111111]">
      <main className="mx-auto w-full max-w-5xl flex-1 p-8">
        <Link
          href="/"
          className="inline-block text-xs text-[#666666] hover:text-[#111111]"
        >
          ← timertempo.com
        </Link>

        <h1 className="mt-8 text-base font-normal text-[#111111]">
          Privacy Policy
        </h1>

        <div className="mt-12 flex flex-col gap-10">
          <section>
            <h2 className="text-sm uppercase tracking-widest text-[#999999]">
              Who we are
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666666]">
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
            <h2 className="text-sm uppercase tracking-widest text-[#999999]">
              Data we collect
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666666]">
              Timer Tempo does not collect, store, or transmit any personal
              data. All timer data is stored locally in your browser using
              localStorage and never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[#999999]">
              Advertising
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666666]">
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
            <h2 className="text-sm uppercase tracking-widest text-[#999999]">
              Cookies
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666666]">
              Timer Tempo itself sets no cookies. Cookies on this site are set
              exclusively by Google AdSense for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[#999999]">
              Your rights
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666666]">
              Since we hold no personal data, there is nothing to access,
              correct, or delete. For data held by Google, refer to
              Google&apos;s privacy controls.
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-[#999999]">
              Contact
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666666]">
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
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-[#666666]">
            <p>
              Tempo lets you run multiple timers at the same time, each with
              its own name and description. Start one for the pasta, another
              for the sauce, another for the oven - they all run independently,
              and they all stay on screen.
            </p>
            <p>
              Most timer apps give you one timer. That works until it
              doesn&apos;t. Timer Tempo was built for the moments when you have
              more than one thing going at once - cooking a full meal, running
              intervals at the gym, managing time blocks at work, keeping a
              meeting on track. Name each timer, add a note if you need it,
              and start them whenever you&apos;re ready.
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-dotted border-[#DDDDDD] pt-6 text-xs text-[#999999]">
            <a href="#" className="hover:text-[#666666]">
              FAQ
            </a>
            <Link href="/privacy" className="hover:text-[#666666]">
              Privacy
            </Link>
            <a
              href="mailto:timertempoapp@gmail.com"
              className="hover:text-[#666666]"
            >
              Contact
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
