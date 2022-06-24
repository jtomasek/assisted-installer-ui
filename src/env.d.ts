// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_BUILD_MODE: string;
  readonly REACT_APP_API_ROOT: string;
  // add more env variables...
}

interface ImportMeta {
  readonly env?: ImportMetaEnv;
}
