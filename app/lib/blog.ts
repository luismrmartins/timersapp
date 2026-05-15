import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  cover?: string;
  author?: string;
};

export type Post = PostMeta & {
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function readPostFile(filename: string): Post | null {
  if (!filename.endsWith(".mdx") && !filename.endsWith(".md")) return null;
  const slug = filename.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  if (data.draft) return null;
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    cover: data.cover ? String(data.cover) : undefined,
    author: data.author ? String(data.author) : undefined,
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR);
  const posts = files
    .map((f) => readPostFile(f))
    .filter((p): p is Post => p !== null)
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  if (!fs.existsSync(BLOG_DIR)) return null;
  for (const ext of [".mdx", ".md"]) {
    const filename = `${slug}${ext}`;
    const fullPath = path.join(BLOG_DIR, filename);
    if (fs.existsSync(fullPath)) {
      return readPostFile(filename);
    }
  }
  return null;
}

export function formatPostDate(iso: string, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
