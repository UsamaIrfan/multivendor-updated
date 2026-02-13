import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    output: {
      mode: 'tags-split',
      target: 'src/generated/api',
      schemas: 'src/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      baseUrl: 'http://localhost:3000',
      override: {
        mutator: undefined,
        query: {
          useQuery: true,
          useSuspenseQuery: false,
          useInfinite: false,
        },
      },
    },
    input: {
      target: 'http://localhost:3000/docs-json',
    },
  },
});
