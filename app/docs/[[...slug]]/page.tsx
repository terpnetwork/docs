import { getPageImage, source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { LLMCopyButton, ViewOptions } from '@/components/ai/page-actions';
import { gitConfig } from '@/lib/layout.shared';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // Support async mode for lazy-loaded community/external MDX docs
  const data = 'load' in page.data && typeof page.data.load === 'function'
    ? await page.data.load()
    : page.data;

  if ('getAPIPageProps' in data && typeof data.getAPIPageProps === 'function') {
    // Lazy-load OpenAPI UI only for API routes — not every MDX doc page
    const { APIPage } = await import('@/lib/openapi');
    const apiPageProps = data.getAPIPageProps();
    const operations = apiPageProps.operations ?? [];
    const webhooks = apiPageProps.webhooks ?? [];
    const toc = 'toc' in data ? data.toc : [];
    const full = 'full' in data ? data.full : false;
    // Type guard: check for a property that only exists in the extended type
    if (!('title' in data)) {
      notFound(); // or handle fallback
    }


    if (operations.length === 0 && webhooks.length === 0) {
      return (
        <DocsPage toc={toc} full={full}>
          <DocsTitle>{data.title}</DocsTitle>
          <DocsDescription>{data.description}</DocsDescription>
          <DocsBody>
            <p>No routes are defined in this OpenAPI specification yet.</p>
          </DocsBody>
        </DocsPage>
      );
    }

    return (
      <DocsPage toc={toc} full={full}>
        <DocsBody>
          <APIPage {...apiPageProps} />
        </DocsBody>
      </DocsPage>
    );
  }
  const full = 'full' in data ? data.full : false;
  if (!('body' in data)) {
    notFound();
  }
  const MDX = data.body;

  return (
    <DocsPage toc={data.toc} full={full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
