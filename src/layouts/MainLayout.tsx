import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer'; // Импортируем футер
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer /> {/* Футер внизу */}
    </div>
  );
}
