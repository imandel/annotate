interface ImportMetaEnv {
MODE: string
    readonly VITE_VIDEO_FILE: string
    readonly VITE_TRANSCRIPT_FILE: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }