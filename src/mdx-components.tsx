import type { MDXComponents } from "mdx/types";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

const headingBase: CSSProperties = {
  fontFamily: "var(--font-ww-serif)",
  fontWeight: 600,
  color: "var(--color-ww-text)",
  letterSpacing: "0.01em",
};

const paragraphStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 2,
  color: "var(--color-ww-text)",
  marginTop: 16,
};

const linkStyle: CSSProperties = {
  color: "var(--color-ww-accent)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

function isInternalHref(href: string | undefined): href is string {
  if (!href) return false;
  return href.startsWith("/") && !href.startsWith("//");
}

const components: MDXComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1
      className="ww-serif"
      style={{
        ...headingBase,
        fontSize: 32,
        lineHeight: 1.4,
        marginTop: 8,
        marginBottom: 16,
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2
      className="ww-serif"
      style={{
        ...headingBase,
        fontSize: 22,
        color: "var(--color-ww-accent)",
        marginTop: 40,
        marginBottom: 16,
        lineHeight: 1.5,
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3
      className="ww-serif"
      style={{
        ...headingBase,
        fontSize: 18,
        marginTop: 32,
        marginBottom: 12,
        lineHeight: 1.5,
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p style={paragraphStyle}>{children}</p>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => {
    if (isInternalHref(href)) {
      return (
        <Link href={href} style={linkStyle}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
      >
        {children}
      </a>
    );
  },
  ul: ({ children }: { children?: ReactNode }) => (
    <ul
      style={{
        listStyle: "disc outside",
        paddingLeft: 24,
        marginTop: 16,
        marginBottom: 16,
        color: "var(--color-ww-text)",
        lineHeight: 1.95,
        fontSize: 16,
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol
      style={{
        listStyle: "decimal outside",
        paddingLeft: 24,
        marginTop: 16,
        marginBottom: 16,
        color: "var(--color-ww-text)",
        lineHeight: 1.95,
        fontSize: 16,
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li style={{ marginTop: 6 }}>{children}</li>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote
      style={{
        borderLeft: "3px solid var(--color-ww-accent-soft)",
        paddingLeft: 16,
        marginTop: 24,
        marginBottom: 24,
        color: "var(--color-ww-text-secondary)",
        fontStyle: "normal",
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr
      style={{
        border: 0,
        borderTop: "1px solid var(--color-ww-border-subtle)",
        margin: "40px 0",
      }}
    />
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong style={{ fontWeight: 600, color: "var(--color-ww-text)" }}>
      {children}
    </strong>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
