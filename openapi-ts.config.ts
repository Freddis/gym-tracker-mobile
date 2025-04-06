import {defineConfig} from '@hey-api/openapi-ts';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

export default defineConfig({
  input: {
    path: 'http://localhost:3000/api/openapi',
  },
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './openapi-client',
  },
  plugins: [
    '@hey-api/client-axios',
    '@tanstack/react-query',
    {
      name: '@hey-api/transformers',
      dates: true,
    },
    {
      name: '@hey-api/sdk',
      transformer: true,
    },
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
    },
  ],
});
