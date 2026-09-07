import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ReactNode } from 'react';
import { Card as FumaCard } from 'fumadocs-ui/components/card';
import { ConnectCalendar } from '@/components/calendar';

type CardProps = ComponentProps<typeof FumaCard> & {
  svgFile?: string;
};

function Card({ svgFile, icon, ...props }: CardProps) {
  const resolvedIcon: ReactNode = icon || (svgFile ? <img src={svgFile} alt="" aria-hidden className="size-4" /> : undefined);

  return <FumaCard {...props} icon={resolvedIcon} />;
}

function Iframe(props: ComponentProps<'iframe'>) {
  return (
    <iframe
      {...props}
      className="w-full rounded-xl border border-border shadow-sm my-6"
      style={{ height: '800px', minHeight: '600px' }}
      allow="clipboard-write; encrypted-media"
      sandbox="allow-scripts allow-same-origin allow-popups"
      allowFullScreen
    />
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    Card,
    ConnectCalendar,
    Iframe,
    ...components,
  } satisfies MDXComponents;
}
