import { useEffect, useState } from 'react';
import { usePlayerControl } from '../../context/PlayerControlContext';
import styles from './AutoplayProgress.module.css';

export function AutoplayProgress() {
  const { autoplayState } = usePlayerControl();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!autoplayState.isActive || !autoplayState.startTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - autoplayState.startTime!) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoplayState.isActive, autoplayState.startTime]);

  if (!autoplayState.isActive) {
    return null;
  }

  const currentExercise = autoplayState.exercises[autoplayState.currentExerciseIndex];
  const totalExercises = autoplayState.exercises.length;
  const progressPercent = ((autoplayState.currentExerciseIndex + 1) / totalExercises) * 100;
  const barsRemaining = autoplayState.barsPerExercise - autoplayState.currentBarCount;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.lessonTitle}>{autoplayState.lessonTitle}</span>
        <span className={styles.timer}>{formatTime(elapsedTime)}</span>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      <div className={styles.info}>
        <div className={styles.exerciseInfo}>
          <span className={styles.exerciseNumber}>{currentExercise?.id || '-'}</span>
          <span className={styles.exerciseProgress}>
            {autoplayState.currentExerciseIndex + 1}/{totalExercises}
          </span>
        </div>
        <div className={styles.barsInfo}>
          {barsRemaining > 0 && (
            <span className={styles.barsRemaining}>
              {barsRemaining} {barsRemaining === 1 ? 'такт' : 'тактов'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
