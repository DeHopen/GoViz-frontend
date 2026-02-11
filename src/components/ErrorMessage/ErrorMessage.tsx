import Icon from '../Icon/Icon';
import styles from '../../styles/ErrorMessage.module.scss';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

export default function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className={styles.error} role="alert">
      <Icon name="alert-triangle" size={18} className={styles.icon} />
      <span className={styles.text}>{message}</span>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
