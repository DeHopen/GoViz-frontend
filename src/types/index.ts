// ─── Статус файла ────────────────────────────────────────────────
export type FileStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

// ─── Файл (FileOut) ─────────────────────────────────────────────
export interface GoFile {
  id: string;
  filename: string;
  style: string;
  status: FileStatus;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

// ─── Список файлов (FileListOut) ────────────────────────────────
export interface FileListResponse {
  files: GoFile[];
  total: number;
}

// ─── Параметры загрузки ──────────────────────────────────────────
export interface UploadParams {
  file: File;
  style?: string;
  onProgress?: (progress: number) => void;
}

// ─── Тема ────────────────────────────────────────────────────────
export type Theme = 'light' | 'dark';
