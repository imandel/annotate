interface ImportMetaEnv {
MODE: string
    readonly VITE_VIDEO_FILES: string
    readonly VITE_TRANSCRIPT_FILE: string
    readonly VITE_MAP_FILE: string
    readonly VITE_OFFSETS: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }