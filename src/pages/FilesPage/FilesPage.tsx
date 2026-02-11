import { Link } from 'react-router-dom';
import { useGetFilesQuery } from '../../services/api';
import Icon from '../../components/Icon/Icon';
import FileCard from '../../components/FileCard/FileCard';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import styles from '../../styles/FilesPage.module.scss';

export default function FilesPage() {
  const { data, isLoading, error, refetch } = useGetFilesQuery();

  const files = data?.files ?? [];
  const total = data?.total ?? 0;

  const errorMessage =
    error && 'data' in error
      ? (error.data as { detail?: string; message?: string })?.detail ||
        (error.data as { message?: string })?.message
      : error
        ? 'Не удалось загрузить список файлов'
        : null;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <Loader text="Загрузка..." fullPage />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Мои файлы</h1>
          {total > 0 && (
            <span className={styles.count}>
              {total} {total === 1 ? 'файл' : total < 5 ? 'файла' : 'файлов'}
            </span>
          )}
        </div>

        {errorMessage && (
          <div style={{ marginBottom: 24 }}>
            <ErrorMessage message={errorMessage} onClose={() => refetch()} />
          </div>
        )}

        {files.length === 0 && !errorMessage ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Icon name="inbox" size={56} />
            </div>
            <h2 className={styles.emptyTitle}>Пока нет файлов</h2>
            <p className={styles.emptyText}>
              Загрузите .go файл, чтобы получить визуализацию.
            </p>
            <Link to="/" className={styles.emptyBtn}>
              <Icon name="upload" size={18} />
              Загрузить файл
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
