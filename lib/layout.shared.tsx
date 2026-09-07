import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const gitConfig = {
  user: 'terpnetwork',
  repo: 'docs',
  branch: 'main',
};

function NavTitle() {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <span
        className="docs-themed-icon inline-flex size-7 items-center justify-center rounded-md bg-fd-primary/12 text-fd-primary ring-1 ring-fd-primary/15"
        aria-hidden
      >
        <svg viewBox="0 0 200 200" className="size-4" fill="currentColor">
          <circle cx="100" cy="100" r="14" />
          <circle cx="52" cy="100" r="11" />
          <circle cx="148" cy="100" r="11" />
          <circle cx="100" cy="52" r="11" />
          <circle cx="100" cy="148" r="11" />
          <circle cx="75" cy="75" r="9" />
          <circle cx="125" cy="75" r="9" />
          <circle cx="75" cy="125" r="9" />
          <circle cx="125" cy="125" r="9" />
        </svg>
      </span>
      <span>Terp Docs</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <NavTitle />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
