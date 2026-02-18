import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileUpload } from '../../hooks/useFileUpload';
import Icon from '../Icon/Icon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import styles from '../../styles/FileUpload.module.scss';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { upload, progress, isUploading, error, reset } = useFileUpload();

  const handleFile = useCallback(
    (selectedFile: File) => {
      reset();
      setFile(selectedFile);
    },
    [reset],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile],
  );

  const handleUpload = async () => {
    if (!file) return;
    const result = await upload(file);
    if (result) {
      navigate(`/files/${result.id}`);
    }
  };

  const removeFile = () => {
    setFile(null);
    reset();
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className={styles.icon}>
          <Icon name="upload-cloud" size={40} />
        </div>
        <p className={styles.title}>
          Перетащите .go файл сюда или нажмите для выбора
        </p>
        <p className={styles.subtitle}>Поддерживаемый формат: .go</p>
        <input
          ref={inputRef}
          type="file"
          className={styles.input}
          accept=".go"
          onChange={handleInputChange}
        />
      </div>

      {file && (
        <div className={styles.fileInfo}>
          <Icon name="file-text" size={18} />
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatSize(file.size)}</span>
          {!isUploading && (
            <button
              className={styles.removeBtn}
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      )}

      {isUploading && (
        <>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.progressText}>Загрузка... {progress}%</p>
        </>
      )}

      {error && (
        <div style={{ marginTop: 16 }}>
          <ErrorMessage message={error} onClose={reset} />
        </div>
      )}

      <button
        className={styles.uploadBtn}
        onClick={handleUpload}
        disabled={!file || isUploading}
      >
        {isUploading ? (
          <>
            <Icon name="loader" size={18} className={styles.spin} />
            Загрузка...
          </>
        ) : (
          <>
            <Icon name="upload" size={18} />
            Загрузить файл
          </>
        )}
      </button>

      <div className={styles.constraints}>
        <span>
          <Icon name="paperclip" size={14} />
          Формат: .go
        </span>
        <span>
          <Icon name="ruler" size={14} />
          Макс. размер: 50 МБ
        </span>
      </div>
    </div>
  );
}
