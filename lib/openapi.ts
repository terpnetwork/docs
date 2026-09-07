import { createOpenAPI, openapiSource } from 'fumadocs-openapi/server';
import { createAPIPage } from 'fumadocs-openapi/ui';
import { multiple, type Source } from 'fumadocs-core/source';

const OPENAPI_INPUT = {
  OPENAPI: 'static/api/openapi.yaml',
  RPC: 'static/api/RPC.yaml',
  LCD: 'static/api/LCD.yaml',
  DATA: 'static/api/DATA.yaml',
  IBCGO: 'static/api/IBCGO.yaml',
} as const;

export type OpenAPIDocumentId = keyof typeof OPENAPI_INPUT;

/**
 * Flat API files under /docs/api/<slug> — one file per surface, no tag folders.
 */
export const OPENAPI_SPECS = [
  { id: 'OPENAPI', slug: 'openapi', title: 'OpenAPI (gRPC-gateway)' },
  { id: 'RPC', slug: 'rpc', title: 'CometBFT RPC' },
  { id: 'LCD', slug: 'lcd', title: 'LCD / REST' },
  { id: 'IBCGO', slug: 'ibcgo', title: 'IBC-Go' },
  { id: 'DATA', slug: 'data', title: 'Historical data' },
] as const satisfies ReadonlyArray<{
  id: OpenAPIDocumentId;
  slug: string;
  title: string;
}>;

export const openapiServer = createOpenAPI({
  input: () => OPENAPI_INPUT,
});

export const APIPage = createAPIPage(openapiServer);

export function resolveOpenAPIDocument(raw?: string): OpenAPIDocumentId {
  if (!raw) return 'OPENAPI';

  const id = raw.toUpperCase() as OpenAPIDocumentId;
  if (id in OPENAPI_INPUT) return id;

  return 'OPENAPI';
}

export function getOpenAPISlug(id: OpenAPIDocumentId): string {
  const spec = OPENAPI_SPECS.find((entry) => entry.id === id);
  return spec?.slug ?? 'openapi';
}

function getOpenAPIBySlug(slug: string) {
  return OPENAPI_SPECS.find((entry) => entry.slug === slug);
}

export async function getOpenAPIDocument(id: OpenAPIDocumentId) {
  return openapiServer.getSchema(id);
}

/**
 * One OpenAPI page per YAML file at /docs/api/<slug>.
 * Operation/tag folder trees intentionally omitted — APIs stay file-level.
 */
export async function getOpenAPIDocsSource(): Promise<Source> {
  const sources: Record<string, Source> = {};

  for (const spec of OPENAPI_SPECS) {
    const server = createOpenAPI({
      input: () => ({ [spec.id]: OPENAPI_INPUT[spec.id] }),
    });

    sources[`openapi-${spec.slug}`] = await openapiSource(server, {
      per: 'file',
      // Flat path: content merges under /docs/api/<slug>
      name: () => `api/${spec.slug}`,
    });
  }

  return multiple(sources);
}

export function resolveOpenAPISlug(raw?: string): string {
  if (!raw) return 'openapi';

  const normalized = raw.toLowerCase();
  if (getOpenAPIBySlug(normalized)) return normalized;

  return getOpenAPISlug(resolveOpenAPIDocument(raw));
}
