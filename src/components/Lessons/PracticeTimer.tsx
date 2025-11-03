import { useState, useEffect, useRef, useCallback } from 'react';
import { resumeAudioContext } from '../../utils/audio';
import { usePlayerControl } from '../../context/PlayerControlContext';
import styles from './PracticeTimer.module.css';

interface PracticeTimerProps {
  onComplete?: () => void;
}

const STORAGE_KEY = 'practiceTimerDuration';

export function PracticeTimer({ onComplete }: PracticeTimerProps) {
  const { playerRef, isPlaying, setIsPlaying, currentBeat, setCurrentBeat, registerStopCallback, unregisterStopCallback } = usePlayerControl();

  // Load duration from localStorage or default to 60
  const [duration, setDuration] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 60;
  });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [shouldStopAtBarEnd, setShouldStopAtBarEnd] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Timer countdown logic
  useEffect(() => {
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            // Timer expired - set flag to stop at next bar
            setShouldStopAtBarEnd(true);
            if (prev === 1 && onComplete) {
              onComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, timeLeft, onComplete]);

  // Stop player at bar end when timer expires
  useEffect(() => {
    if (shouldStopAtBarEnd && currentBeat.rhythmIndex === 0 && playerRef.current && isPlaying) {
      // We're at the start of a new bar, stop the player
      playerRef.current.stop();
      setIsPlaying(false);
      setCurrentBeat({ barIndex: 0, rhythmIndex: 0 });
      setShouldStopAtBarEnd(false);

      // Reset timer state to initial
      setTimeLeft(null);
      setIsTimerRunning(false);
    }
  }, [shouldStopAtBarEnd, currentBeat, playerRef, isPlaying, setIsPlaying, setCurrentBeat]);

  // Register callback for when player is stopped externally
  const handlePlayerStop = useCallback(() => {
    // If player stopped, also stop the timer and reset to initial state
    setIsTimerRunning(false);
    setShouldStopAtBarEnd(false);
    setTimeLeft(null);
  }, []);

  useEffect(() => {
    registerStopCallback(handlePlayerStop);
    return () => {
      unregisterStopCallback(handlePlayerStop);
    };
  }, [registerStopCallback, unregisterStopCallback, handlePlayerStop]);

  const handleToggle = () => {
    if (timeLeft === null) {
      // Start training
      setTimeLeft(duration);
      setIsTimerRunning(true);
      setShouldStopAtBarEnd(false);

      // Start the player if it's not playing
      if (playerRef.current && !isPlaying) {
        resumeAudioContext();
        playerRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Stop training
      setIsTimerRunning(false);
      setTimeLeft(null);
      setShouldStopAtBarEnd(false);

      // Stop the player
      if (playerRef.current && isPlaying) {
        playerRef.current.stop();
        setIsPlaying(false);
        setCurrentBeat({ barIndex: 0, rhythmIndex: 0 });
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDuration(value);
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, value.toString());
    }
  };

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timerHeader}>
        <span className={styles.timerLabel}>Тренировка</span>
      </div>

      <div className={styles.content}>
        <div className={styles.inputGroup}>
          <label htmlFor="timer-duration" className={styles.inputLabel}>
            Время (сек):
          </label>
          <input
            id="timer-duration"
            type="number"
            min="1"
            max="3600"
            value={duration}
            onChange={handleDurationChange}
            className={styles.input}
            disabled={timeLeft !== null}
          />
        </div>

        {timeLeft !== null && (
          <div className={styles.display}>
            <span className={styles.timeDisplay}>{formatTime(timeLeft)}</span>
          </div>
        )}

        <button
          onClick={handleToggle}
          className={timeLeft === null ? styles.startButton : styles.stopButton}
          aria-label={timeLeft === null ? 'Начать тренировку' : 'Остановить тренировку'}
        >
          {timeLeft === null ? 'Старт' : 'Стоп'}
        </button>
      </div>
    </div>
  );
}
