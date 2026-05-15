import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import YouTube from "./YouTube";

function PostImage(props: ImageProps) {
  const { src, alt = "", width, height, ...rest } = props;
  if (typeof src === "string" && (!width || !height)) {
    return (
      // Fallback: when no width/height was provided, use a plain <img>.
      // Authors can pass width/height in the MDX to opt into next/image
      // optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="my-8 h-auto w-full"
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="(min-width: 768px) 720px, 100vw"
      className="my-8 h-auto w-full"
      {...rest}
    />
  );
}

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="mt-12 mb-4 text-3xl font-medium uppercase tracking-wide"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-10 mb-3 text-2xl font-medium uppercase tracking-wide"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mt-8 mb-2 text-xl font-medium" {...props} />
  ),
  p: (props) => (
    <p className="my-5 text-base leading-relaxed text-[var(--fg)]/80" {...props} />
  ),
  a: (props) => (
    <a
      className="underline underline-offset-2 hover:text-[var(--fg)]"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noreferrer" : undefined}
      {...props}
    />
  ),
  ul: (props) => (
    <ul className="my-5 list-disc space-y-2 pl-6 text-[var(--fg)]/80" {...props} />
  ),
  ol: (props) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 text-[var(--fg)]/80" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-2 border-[var(--fg)]/30 pl-4 text-[var(--fg)]/60 italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-[var(--fg)]/10 px-1.5 py-0.5 text-[0.9em] font-mono"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-md bg-[var(--fg)]/5 p-4 text-sm font-mono"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-[var(--fg)]/15" />,
  img: PostImage as MDXComponents["img"],
  YouTube,
};
