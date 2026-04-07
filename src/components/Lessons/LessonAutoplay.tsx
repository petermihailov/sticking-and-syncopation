import { useState } from 'react';
import { usePlayerControl } from '../../context/PlayerControlContext';
import type { Lesson } from './lessonData';
import styles from './LessonAutoplay.module.css';

const STORAGE_KEY_BARS = 'lessonAutoplayBars';
const STORAGE_KEY_PAUSE = 'lessonAutoplayPause';

interface LessonAutoplayProps {
  lesson: Lesson;
}

export function LessonAutoplay({ lesson }: LessonAutoplayProps) {
  const { autoplayState, startAutoplay, stopAutoplay } = usePlayerControl();

  const [barsPerExercise, setBarsPerExercise] = useState<8 | 16>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BARS);
    return saved === '16' ? 16 : 8;
  });

  const [pauseBetweenExercises, setPauseBetweenExercises] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PAUSE);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [showSettings, setShowSettings] = useState(false);

  const isActive = autoplayState.isActive && autoplayState.lessonId === lesson.id;

  const handleBarsChange = (value: 8 | 16) => {
    setBarsPerExercise(value);
    localStorage.setItem(STORAGE_KEY_BARS, value.toString());
  };

  const handlePauseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setPauseBetweenExercises(value);
      localStorage.setItem(STORAGE_KEY_PAUSE, value.toString());
    }
  };

  const handleStart = () => {
    startAutoplay(lesson.id, lesson.title, lesson.exercises, {
      barsPerExercise,
      pauseBetweenExercises,
    });
    setShowSettings(false);
  };

  const handleStop = () => {
    stopAutoplay();
  };

  return (
    <div className={styles.container}>
      {isActive ? (
        <button onClick={handleStop} className={styles.stopButton} aria-label="Остановить автоплей">
          ⏹ Стоп
        </button>
      ) : (
        <>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={styles.toggleButton}
            aria-label="Настройки автоплея"
          >
            ▶ Автоплей
          </button>

          {showSettings && (
            <div className={styles.settings}>
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>Тактов на упражнение:</label>
                <div className={styles.buttonGroup}>
                  <button
                    onClick={() => handleBarsChange(8)}
                    className={barsPerExercise === 8 ? styles.activeOption : styles.option}
                  >
                    8
                  </button>
                  <button
                    onClick={() => handleBarsChange(16)}
                    className={barsPerExercise === 16 ? styles.activeOption : styles.option}
                  >
                    16
                  </button>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <label htmlFor={`pause-${lesson.id}`} className={styles.settingLabel}>
                  Пауза между (сек):
                </label>
                <input
                  id={`pause-${lesson.id}`}
                  type="number"
                  min="0"
                  max="10"
                  value={pauseBetweenExercises}
                  onChange={handlePauseChange}
                  className={styles.input}
                />
              </div>

              <button onClick={handleStart} className={styles.startButton}>
                Начать
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
