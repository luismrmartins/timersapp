import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Icon from "../../../components/Icon";
import ThemeToggle from "../../../components/ThemeToggle";
import { mdxComponents } from "../../../components/mdx/components";
import { isLocale } from "../../../i18n/config";
import { getDictionary } from "../../../i18n/dictionaries";
import {
  formatPostDate,
  getAllPosts,
  getPostBySlug,
} from "../../../lib/blog";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} - Timer Tempo`,
    description: post.excerpt,
    alternates: { canonical: `/${lang}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/${lang}/blog/${post.slug}`,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const dict = await getDictionary(lang);

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

        <Link
          href={`/${lang}/blog`}
          className="mt-10 inline-flex w-fit items-center gap-1 text-xs uppercase tracking-widest text-[var(--fg)]/60 hover:text-[var(--fg)]"
        >
          ← {dict.blog?.backToIndex ?? "Back to blog"}
        </Link>

        <article className="mt-6">
          <header className="flex flex-col gap-3">
            {post.date && (
              <time className="text-[10px] uppercase tracking-widest text-[var(--fg)]/50">
                {formatPostDate(post.date, lang)}
              </time>
            )}
            <h1 className="text-3xl font-medium uppercase tracking-wide sm:text-4xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-base leading-relaxed text-[var(--fg)]/60">
                {post.excerpt}
              </p>
            )}
          </header>

          <div className="mt-4">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>
        </article>

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
