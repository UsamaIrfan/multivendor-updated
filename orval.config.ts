import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    output: {
      mode: 'tags-split',
      target: '../client/src/services/api/generated/endpoints',
      schemas: '../client/src/services/api/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      baseUrl: 'http://localhost:3000',
      override: {
        mutator: {
          path: '../client/src/services/api/generated/custom-fetch.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useSuspenseQuery: false,
          useInfinite: true,
          useInfiniteQueryParam: 'page'
        },
      },
    },
    input: {
      target: 'http://localhost:3000/docs-json',
    },
  },
});
