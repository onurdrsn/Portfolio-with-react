/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Diğer ortam değişkenlerini buraya ekleyebilirsiniz...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
