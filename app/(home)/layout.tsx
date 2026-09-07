import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

/**
 * Marketing home — HomeLayout only.
 * Avoid DocsLayout/flux here (sidebar tree + heavy chrome on `/`).
 */
export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
