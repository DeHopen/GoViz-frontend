import styles from '../../styles/Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>© {new Date().getFullYear()} GoViz — Визуализация Go-кода</span>
        <span>Дипломный проект</span>
      </div>
    </footer>
  );
}
