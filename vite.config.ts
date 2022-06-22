import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { peerDependencies } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'openshift-assisted-ui-lib',
      formats: ['es'],
      fileName: (format) => `openshift-assisted-ui-lib.${format}.js`,
    },
    rollupOptions: {
      external: Object.keys(peerDependencies) || [],
      // external: [
      //   'react',
      //   'react-dom',
      //   '@patternfly/react-code-editor',
      //   '@patternfly/react-core',
      //   '@patternfly/react-icons',
      //   '@patternfly/react-styles',
      //   '@patternfly/react-table',
      //   '@patternfly/react-tokens',
      //   'react-router-dom',
      // ],
      input: {
        root: path.resolve(__dirname, 'src/index.ts'),
        ocm: path.resolve(__dirname, 'src/ocm/index.ts'),
        cim: path.resolve(__dirname, 'src/cim/index.ts'),
      },
      output: {
        dir: 'dist',
        entryFileNames: ({ name }) => {
          const baseName = 'openshift-assisted-ui-lib';
          if (name === 'root') {
            return `${baseName}.es.js`;
          }
          return `${baseName}-${name}.es.js`;
        },
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
  },
});
