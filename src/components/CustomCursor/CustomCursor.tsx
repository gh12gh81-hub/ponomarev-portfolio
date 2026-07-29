import { useState, useEffect } from 'react';
import styles from './CustomCursor.module.css';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    const hoverStart = () => setIsHovering(true);
    const hoverEnd = () => setIsHovering(false);

    window.addEventListener('mousemove', move);
    
    // Для карточек добавляем класс 'hoverable' в Link (в Home.tsx)
    document.querySelectorAll('.hoverable').forEach(el => {
      el.addEventListener('mouseenter', hoverStart);
      el.addEventListener('mouseleave', hoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      document.querySelectorAll('.hoverable').forEach(el => {
        el.removeEventListener('mouseenter', hoverStart);
        el.removeEventListener('mouseleave', hoverEnd);
      });
    };
  }, []);

  return (
    <div 
      className={`${styles.cursor} ${isHovering ? styles.hovering : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {isHovering && <span className={styles.viewText}>View</span>}
    </div>
  );
};
