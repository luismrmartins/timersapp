import type { MetadataRoute } from "next";
import { locales } from "./i18n/config";
import { getAllPosts } from "./lib/blog";

const BASE = "https://timertempo.com";

function languageAlternates(pathSuffix: string): Record<string, string> {
  return Object.fromEntries(
    locales.map((l) => [l, `${BASE}/${l}${pathSuffix}`]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPosts();
  const newestPostDate = posts[0]?.date ? new Date(posts[0].date) : now;

  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    // Home — content genuinely differs per locale, so all 9 are first-class.
    entries.push({
      url: `${BASE}/${lang}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: lang === "en" ? 1.0 : 0.9,
      alternates: { languages: languageAlternates("") },
    });

    // FAQ
    entries.push({
      url: `${BASE}/${lang}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: languageAlternates("/faq") },
    });

    // Blog index
    entries.push({
      url: `${BASE}/${lang}/blog`,
      lastModified: newestPostDate,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: { languages: languageAlternates("/blog") },
    });
  }

  // Blog posts: English only — MDX source isn't translated, so submitting
  // /fr/blog/foo etc. would just hand Google obvious duplicates.
  for (const post of posts) {
    entries.push({
      url: `${BASE}/en/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  return entries;
}
