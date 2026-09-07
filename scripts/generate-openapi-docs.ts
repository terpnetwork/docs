import { generateFiles } from 'fumadocs-openapi';
import { openapiServer } from '@/lib/openapi';

void generateFiles({
  input: openapiServer,
  output: './content/docs/ecosystem/modules',
  // we recommend to enable it
  // make sure your endpoint description doesn't break MDX syntax.
  includeDescription: true,
});