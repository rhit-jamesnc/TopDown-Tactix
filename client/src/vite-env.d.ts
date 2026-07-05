export interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}