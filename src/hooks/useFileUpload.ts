import { useState, useCallback } from 'react';
import { useUploadFileMutation } from '../services/api';
import type { GoFile } from '../types';

interface UseFileUploadReturn {
  upload: (file: File, style?: string) => Promise<GoFile | null>;
  progress: number;
  isUploading: boolean;
  error: string | null;
  reset: () => void;
}

const ALLOWED_EXTENSIONS = ['.go'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export function useFileUpload(): UseFileUploadReturn {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File, style?: string): Promise<GoFile | null> => {
      setError(null);
      setProgress(0);

      // Валидация расширения
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError('Неподдерживаемый формат файла. Допустимый формат: .go');
        return null;
      }

      // Валидация размера
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024} МБ`
        );
        return null;
      }

      try {
        const result = await uploadFile({
          file,
          style: style || undefined,
          onProgress: setProgress,
        }).unwrap();

        setProgress(100);
        return result;
      } catch (err) {
        const apiErr = err as { data?: { message?: string } };
        setError(apiErr?.data?.message || 'Произошла неизвестная ошибка при загрузке');
        return null;
      }
    },
    [uploadFile]
  );

  return { upload, progress, isUploading, error, reset };
}
