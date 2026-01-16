/// <reference types="vite/client" />

interface Window {
  ethereum?: any;
}

interface ImportMetaEnv {
  readonly VITE_BASE_SEPOLIA_RPC: string;
  readonly VITE_BLOCKSCOUT_API_KEY: string;
  readonly VITE_PRIVATE_KEY?: string;
  readonly BASE_SEPOLIA_RPC: string;
  readonly BLOCKSCOUT_API_KEY: string;
  readonly PRIVATE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
