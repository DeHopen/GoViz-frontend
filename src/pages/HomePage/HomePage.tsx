import type { ReactNode } from 'react';
import Icon from '../../components/Icon/Icon';
import FileUpload from '../../components/FileUpload/FileUpload';
import styles from '../../styles/HomePage.module.scss';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Icon name="upload" size={28} />,
    title: 'Загрузка файла',
    description:
      'Загрузите .go файл вашего Go-проекта. Сервис автоматически проанализирует код и создаст визуализацию.',
  },
  {
    icon: <Icon name="search" size={28} />,
    title: 'Анализ кода',
    description:
      'Система разбирает зависимости, пакеты и связи между компонентами вашего Go-кода.',
  },
  {
    icon: <Icon name="chart-bar" size={28} />,
    title: 'Визуализация',
    description:
      'Получите интерактивную HTML-визуализацию, которую можно просмотреть прямо в браузере.',
  },
  {
    icon: <Icon name="folder" size={28} />,
    title: 'История загрузок',
    description:
      'Все загруженные файлы сохраняются. Вернитесь к любой визуализации в любое время.',
  },
  {
    icon: <Icon name="palette" size={28} />,
    title: 'Удобный интерфейс',
    description:
      'Светлая и тёмная тема, адаптивный дизайн — работайте с любого устройства.',
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.badge}>
            <Icon name="sparkles" size={16} />
            Визуализация Go-кода
          </div>
          <h1 className={styles.title}>
            Превратите ваш Go-файл
            <br />в <span className={styles.highlight}>интерактивную визуализацию</span>
          </h1>
          <p className={styles.description}>
            Загрузите .go файл и получите наглядную HTML-визуализацию
            структуры и зависимостей вашего кода.
          </p>
        </div>
      </section>

      <section className={styles.uploadSection}>
        <div className="container">
          <FileUpload />
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.featuresTitle}>Как это работает</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
