import { NavLink } from 'react-router-dom';
import Icon from '../Icon/Icon';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import styles from '../../styles/Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.logo}>
          <Icon name="chart-bar" size={22} className={styles.logoIcon} />
          <span>GoViz</span>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Загрузить
          </NavLink>
          <NavLink
            to="/files"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Мои файлы
          </NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
