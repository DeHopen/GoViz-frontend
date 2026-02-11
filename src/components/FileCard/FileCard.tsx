import { Link } from 'react-router-dom';
import type { GoFile } from '../../types';
import Icon from '../Icon/Icon';
import styles from '../../styles/FileCard.module.scss';

interface FileCardProps {
  file: GoFile;
}

const statusLabels: Record<string, string> = {
  completed: 'Готово',
  processing: 'Обработка',
  uploaded: 'Загружен',
  failed: 'Ошибка',
};

const statusIconNames: Record<string, string> = {
  completed: 'check-circle',
  processing: 'loader',
  uploaded: 'clock',
  failed: 'x-circle',
};

function getStatusClass(status: string): string {
  switch (status) {
    case 'completed':
      return styles.statusCompleted;
    case 'processing':
      return styles.statusProcessing;
    case 'uploaded':
      return styles.statusPending;
    case 'failed':
      return styles.statusError;
    default:
      return '';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FileCard({ file }: FileCardProps) {
  return (
    <Link to={`/files/${file.id}`} className={styles.card}>
      <div className={styles.iconWrapper}>
        <Icon name="file-text" size={22} />
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{file.filename}</p>
        <p className={styles.date}>{formatDate(file.created_at)}</p>
      </div>

      <span className={`${styles.status} ${getStatusClass(file.status)}`}>
        <Icon
          name={statusIconNames[file.status] || 'clock'}
          size={14}
          className={file.status === 'processing' ? styles.spin : undefined}
        />
        {statusLabels[file.status]}
      </span>

      <Icon name="chevron-right" size={18} className={styles.arrow} />
    </Link>
  );
}
