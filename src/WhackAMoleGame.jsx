import React, { useState, useEffect, useRef } from 'react';

const HOLES = 9;
const GAME_DURATION = 30;
const MOLES = ['🐹', '🐭', '🐾'];
const BOMB = '💣';

const diffSettings = {
  easy: { showTime: 1200, interval: 1500 },
  medium: { showTime: 800, interval: 1000 },
  hard: { showTime: 500, interval: 700 }
};

const WhackAMoleGame = () => {
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [running, setRunning] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [holes, setHoles] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [message, setMessage] = useState('Press Start to play!');

  const countdownInterval = useRef(null);
  const moleSpawnTimeout = useRef(null);
  const moleTimers = useRef([]);
  const activeHoles = useRef(new Set());

  // Initialize holes
  useEffect(() => {
    initializeHoles();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Game tick
  useEffect(() => {
    if (running && timeLeft > 0) {
      countdownInterval.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval.current);
    }
  }, [running]);

  // Schedule mole appearances
  useEffect(() => {
    if (running) {
      scheduleMole();
    }
    return () => {
      if (moleSpawnTimeout.current) {
        clearTimeout(moleSpawnTimeout.current);
      }
    };
  }, [running, difficulty]);

  const initializeHoles = () => {
    const newHoles = Array.from({ length: HOLES }, (_, i) => ({
      id: i,
      isUp: false,
      isBomb: false,
      isHit: false,
      emoji: MOLES[0]
    }));
    setHoles(newHoles);
  };

  const cleanup = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    if (moleSpawnTimeout.current) clearTimeout(moleSpawnTimeout.current);
    moleTimers.current.forEach(clearTimeout);
    moleTimers.current = [];
    activeHoles.current.clear();
  };

  const getDiff = () => diffSettings[difficulty];

  const startGame = () => {
    cleanup();
    setScore(0);
    setMissed(0);
    setTimeLeft(GAME_DURATION);
    setRunning(true);
    setShowOverlay(false);
    setMessage('Hit the moles!');
    activeHoles.current.clear();
    initializeHoles();
  };

  const scheduleMole = () => {
    if (!running) return;

    const diff = getDiff();
    moleSpawnTimeout.current = setTimeout(() => {
      showMole();
      if (running) scheduleMole();
    }, diff.interval);
  };

  const showMole = () => {
    const available = holes
      .map((h, i) => i)
      .filter(i => !activeHoles.current.has(i));

    if (available.length === 0) return;

    const idx = available[Math.floor(Math.random() * available.length)];
    const isBomb = Math.random() < 0.15;
    const emoji = isBomb ? BOMB : MOLES[Math.floor(Math.random() * MOLES.length)];

    setHoles(prev => {
      const newHoles = [...prev];
      newHoles[idx] = {
        ...newHoles[idx],
        isUp: true,
        isBomb,
        emoji,
        isHit: false
      };
      return newHoles;
    });

    activeHoles.current.add(idx);

    const diff = getDiff();
    const timer = setTimeout(() => {
      if (activeHoles.current.has(idx)) {
        setHoles(prev => {
          const newHoles = [...prev];
          newHoles[idx] = { ...newHoles[idx], isUp: false };
          return newHoles;
        });
        activeHoles.current.delete(idx);

        if (!isBomb && running) {
          setMissed(prev => prev + 1);
          setMessage('Missed!');
        }
      }
    }, diff.showTime);

    moleTimers.current.push(timer);
  };

  const whack = (idx) => {
    if (!running) return;
    if (!activeHoles.current.has(idx)) return;

    const hole = holes[idx];
    if (!hole.isUp) return;

    activeHoles.current.delete(idx);

    setHoles(prev => {
      const newHoles = [...prev];
      newHoles[idx] = { ...newHoles[idx], isUp: false, isHit: true };
      return newHoles;
    });

    if (hole.isBomb) {
      setScore(prev => Math.max(0, prev - 5));
      setMessage('Ouch! -5 (bomb!)');
    } else {
      setScore(prev => prev + 10);
      setMessage('+10!');
    }

    // Reset hit state after animation
    setTimeout(() => {
      setHoles(prev => {
        const newHoles = [...prev];
        newHoles[idx] = { ...newHoles[idx], isHit: false };
        return newHoles;
      });
    }, 200);
  };

  const endGame = () => {
    setRunning(false);
    cleanup();

    if (score > best) {
      setBest(score);
    }

    setHoles(prev => prev.map(h => ({ ...h, isUp: false })));
    setMessage('');
    setShowOverlay(true);
  };

  const getTimerBarWidth = () => {
    return (timeLeft / GAME_DURATION) * 100;
  };

  const getTimerBarColor = () => {
    const pct = getTimerBarWidth();
    if (pct > 50) return '#1D9E75';
    if (pct > 25) return '#EF9F27';
    return '#E24B4A';
  };

  const getResultEmoji = () => {
    if (score >= 100) return '🏆';
    if (score >= 50) return '😄';
    return '😢';
  };

  const getResultTitle = () => {
    if (score >= 100) return 'Amazing!';
    if (score >= 50) return 'Nice work!';
    return 'Keep trying!';
  };

  return (
    <div style={styles.container}>
      <div style={styles.game}>
        {/* HUD */}
        <div style={styles.hud}>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Score</div>
            <div style={styles.statValue} data-testid="score">{score}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Best</div>
            <div style={styles.statValue} data-testid="best">{best}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Time</div>
            <div style={styles.statValue} data-testid="time">{timeLeft}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Missed</div>
            <div style={styles.statValue} data-testid="missed">{missed}</div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div style={styles.difficulty}>
          Difficulty:
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={running}
            style={styles.select}
            data-testid="difficulty-select"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Timer Bar */}
        <div style={styles.timerBarWrap}>
          <div
            style={{
              ...styles.timerBar,
              width: `${getTimerBarWidth()}%`,
              background: getTimerBarColor()
            }}
            data-testid="timer-bar"
          />
        </div>

        {/* Grid */}
        <div style={styles.grid}>
          {holes.map((hole, idx) => (
            <div
              key={hole.id}
              style={{
                ...styles.hole,
                ...(hole.isHit && styles.holeHit)
              }}
              onClick={() => whack(idx)}
              data-testid={`hole-${idx}`}
            >
              <div
                style={{
                  ...styles.mole,
                  bottom: hole.isUp ? '10%' : '-100%',
                  ...(hole.isHit && styles.moleHit)
                }}
                data-testid={`mole-${idx}`}
              >
                {hole.emoji}
              </div>
            </div>
          ))}
        </div>

        {/* Message */}
        <div style={styles.message} data-testid="message">
          {message}
        </div>

        {/* Start Button */}
        <button
          onClick={startGame}
          disabled={running}
          style={{
            ...styles.button,
            ...(running && styles.buttonDisabled)
          }}
          data-testid="start-button"
        >
          {running ? 'Running...' : 'Start'}
        </button>
      </div>

      {/* Game Over Overlay */}
      {showOverlay && (
        <div style={styles.overlay} data-testid="game-over-overlay">
          <div style={styles.resultCard}>
            <div style={styles.resultEmoji}>{getResultEmoji()}</div>
            <h2 style={styles.resultTitle}>{getResultTitle()}</h2>
            <p style={styles.resultBody}>
              You scored {score} points with {missed} miss{missed !== 1 ? 'es' : ''}.
            </p>
            <button
              onClick={startGame}
              style={styles.resultButton}
              data-testid="play-again-button"
            >
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-background-primary, #ffffff)',
  },
  game: {
    textAlign: 'center',
    padding: '1.5rem 1rem',
    userSelect: 'none',
    maxWidth: '600px',
    width: '100%',
  },
  hud: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  stat: {
    background: 'var(--color-background-secondary, #f5f5f5)',
    borderRadius: '8px',
    padding: '0.5rem 1.25rem',
    minWidth: '90px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--color-text-secondary, #666)',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '500',
    color: 'var(--color-text-primary, #000)',
  },
  difficulty: {
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '14px',
    color: 'var(--color-text-secondary, #666)',
  },
  select: {
    fontSize: '14px',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '0.5px solid var(--color-border-secondary, #ddd)',
    background: 'var(--color-background-primary, #fff)',
    color: 'var(--color-text-primary, #000)',
  },
  timerBarWrap: {
    maxWidth: '340px',
    margin: '0 auto 1rem',
    background: 'var(--color-background-secondary, #f5f5f5)',
    borderRadius: '99px',
    height: '6px',
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.1s linear, background 0.3s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    maxWidth: '340px',
    margin: '0 auto 1.25rem',
  },
  hole: {
    aspectRatio: '1',
    background: 'var(--color-background-secondary, #f5f5f5)',
    border: '0.5px solid var(--color-border-secondary, #ddd)',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.6rem',
    transition: 'transform 0.08s',
    position: 'relative',
    overflow: 'hidden',
  },
  holeHit: {
    background: '#FAECE7',
  },
  mole: {
    position: 'absolute',
    fontSize: '2.6rem',
    transition: 'bottom 0.15s ease-out',
    lineHeight: 1,
  },
  moleHit: {
    filter: 'grayscale(1)',
  },
  message: {
    fontSize: '14px',
    color: 'var(--color-text-secondary, #666)',
    marginBottom: '1rem',
    minHeight: '20px',
  },
  button: {
    padding: '0.5rem 2rem',
    fontSize: '15px',
    fontWeight: '500',
    borderRadius: '8px',
    border: '0.5px solid var(--color-border-secondary, #ddd)',
    background: 'var(--color-background-primary, #fff)',
    color: 'var(--color-text-primary, #000)',
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  resultCard: {
    background: 'var(--color-background-primary, #fff)',
    borderRadius: '12px',
    border: '0.5px solid var(--color-border-tertiary, #ddd)',
    padding: '2rem 2.5rem',
    textAlign: 'center',
    maxWidth: '280px',
  },
  resultEmoji: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  resultTitle: {
    fontSize: '20px',
    fontWeight: '500',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0',
  },
  resultBody: {
    fontSize: '14px',
    color: 'var(--color-text-secondary, #666)',
    marginBottom: '1.5rem',
  },
  resultButton: {
    padding: '0.5rem 2rem',
    fontSize: '15px',
    borderRadius: '8px',
    border: '0.5px solid var(--color-border-secondary, #ddd)',
    background: 'var(--color-background-secondary, #f5f5f5)',
    color: 'var(--color-text-primary, #000)',
    cursor: 'pointer',
  },
};

export default WhackAMoleGame;
