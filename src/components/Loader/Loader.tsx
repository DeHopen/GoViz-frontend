import styles from '../../styles/Loader.module.scss';

interface LoaderProps {
  text?: string;
  fullPage?: boolean;
}

export default function Loader({ text = 'Загрузка...', fullPage = false }: LoaderProps) {
  return (
    <div className={`${styles.loader} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
