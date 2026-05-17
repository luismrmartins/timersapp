import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "../../components/Icon";
import ThemeToggle from "../../components/ThemeToggle";
import { isLocale } from "../../i18n/config";
import { getDictionary } from "../../i18n/dictionaries";
import { formatPostDate, getAllPosts } from "../../lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.blogTitle ?? "Blog - Timer Tempo",
    description:
      dict.blog?.description ?? "Notes, updates, and stories about Timer Tempo.",
    alternates: { canonical: `/${lang}/blog` },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const posts = getAllPosts();

  return (
    <div className="flex flex-1 flex-col bg-[var(--bg)] font-mono text-[var(--fg)]">
      <main className="flex w-full max-w-3xl flex-1 flex-col p-8">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/${lang}`} className="inline-block shrink-0">
            <Image
              src="/Tempo.png"
              alt="Timer Tempo"
              width={92}
              height={30}
              priority
              className="h-auto w-[92px] max-w-none dark:invert dark:brightness-[1.35]"
            />
          </Link>
          <div className="flex items-center gap-1 text-lg">
            <Link
              href={`/${lang}`}
              aria-label={dict.common.backHome}
              title={dict.common.backHome}
              className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)]"
            >
              <Icon name="arrow_back" />
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <h1 className="mt-12 text-base font-normal text-[var(--fg)]">
          {dict.blog?.title ?? "Blog"}
        </h1>

        {posts.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--fg)]/50">
            {dict.blog?.empty ?? "No posts yet."}
          </p>
        ) : (
          <ul className="mt-10 flex flex-col">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="border-t border-dotted border-[var(--fg)]/20 first:border-t-0"
              >
                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  className="flex flex-col gap-2 py-6 hover:opacity-80"
                >
                  {post.date && (
                    <time className="text-[10px] uppercase tracking-widest text-[var(--fg)]/50">
                      {formatPostDate(post.date, lang)}
                    </time>
                  )}
                  <h2 className="text-xl font-medium uppercase tracking-wide">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm leading-relaxed text-[var(--fg)]/60">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-auto pt-16">
          <div className="flex items-center justify-between border-t border-dotted border-[var(--fg)]/20 pt-6 text-xs text-[var(--fg)]/50">
            <Link href={`/${lang}/faq`} className="hover:text-[var(--fg)]">
              {dict.footer.faq}
            </Link>
            <Link href={`/${lang}/privacy`} className="hover:text-[var(--fg)]">
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
