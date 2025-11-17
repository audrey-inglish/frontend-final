/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Agent Configuration
  readonly VITE_AGENT_ENDPOINT?: string;
  readonly VITE_AGENT_MODEL?: string;
  readonly VITE_AGENT_API_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
