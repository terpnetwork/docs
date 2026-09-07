import { getOpenAPISlug, resolveOpenAPIDocument } from '@/lib/openapi';
import { redirect } from 'next/navigation';

type SearchParams = {
  v?: string;
};

export default async function LegacyAPIPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const document = resolveOpenAPIDocument(params.v);
  const slug = getOpenAPISlug(document);

  redirect(`/docs/api/${slug}`);
}
