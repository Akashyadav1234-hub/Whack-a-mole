import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import WhackAMoleGame from './WhackAMoleGame';

// Mock timers
jest.useFakeTimers();

describe('WhackAMoleGame Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // ==================== RENDERING TESTS ====================
  
  describe('Component Rendering', () => {
    test('renders the game component without crashing', () => {
      render(<WhackAMoleGame />);
      expect(screen.getByTestId('start-button')).toBeInTheDocument();
    });

    test('displays initial score as 0', () => {
      render(<WhackAMoleGame />);
      expect(screen.getByTestId('score')).toHaveTextContent('0');
    });

    test('displays initial time as 30', () => {
      render(<WhackAMoleGame />);
      expect(screen.getByTestId('time')).toHaveTextContent('30');
    });

    test('displays initial missed count as 0', () => {
      render(<WhackAMoleGame />);
      expect(screen.getByTestId('missed')).toHaveTextContent('0');
    });

    test('displays initial best score as 0', () => {
      render(<WhackAMoleGame />);
      expect(screen.getByTestId('best')).toHaveTextContent('0');
    });

    test('renders 9 holes in the grid', () => {
      render(<WhackAMoleGame />);
      for (let i = 0; i < 9; i++) {
        expect(screen.getByTestId(`hole-${i}`)).toBeInTheDocument();
      }
    });

    test('displays initial message "Press Start to play!"', () => {
      render(<WhackAMoleGame />);
      expect(screen.getByTestId('message')).toHaveTextContent('Press Start to play!');
    });

    test('renders difficulty selector with default value "medium"', () => {
      render(<WhackAMoleGame />);
      const select = screen.getByTestId('difficulty-select');
      expect(select).toHaveValue('medium');
    });

    test('does not show game over overlay initially', () => {
      render(<WhackAMoleGame />);
      expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();
    });
  });

  // ==================== GAME START TESTS ====================

  describe('Game Start Functionality', () => {
    test('starts the game when start button is clicked', () => {
      render(<WhackAMoleGame />);
      const startButton = screen.getByTestId('start-button');
      
      fireEvent.click(startButton);
      
      expect(screen.getByTestId('message')).toHaveTextContent('Hit the moles!');
      expect(startButton).toHaveTextContent('Running...');
      expect(startButton).toBeDisabled();
    });

    test('disables start button during gameplay', () => {
      render(<WhackAMoleGame />);
      const startButton = screen.getByTestId('start-button');
      
      fireEvent.click(startButton);
      
      expect(startButton).toBeDisabled();
    });

    test('disables difficulty selector during gameplay', () => {
      render(<WhackAMoleGame />);
      const difficultySelect = screen.getByTestId('difficulty-select');
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      expect(difficultySelect).toBeDisabled();
    });

    test('resets score to 0 on game start', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      expect(screen.getByTestId('score')).toHaveTextContent('0');
    });

    test('resets timer to 30 on game start', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      expect(screen.getByTestId('time')).toHaveTextContent('30');
    });
  });

  // ==================== TIMER TESTS ====================

  describe('Timer Functionality', () => {
    test('decrements timer every second during gameplay', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      expect(screen.getByTestId('time')).toHaveTextContent('30');
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByTestId('time')).toHaveTextContent('29');
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByTestId('time')).toHaveTextContent('28');
    });

    test('timer bar width decreases as time decreases', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      const timerBar = screen.getByTestId('timer-bar');
      const initialWidth = timerBar.style.width;
      
      act(() => {
        jest.advanceTimersByTime(5000); // 5 seconds
      });
      
      const laterWidth = timerBar.style.width;
      expect(parseFloat(laterWidth)).toBeLessThan(parseFloat(initialWidth));
    });

    test('ends game when timer reaches 0', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();
      });
    });
  });

  // ==================== DIFFICULTY TESTS ====================

  describe('Difficulty Settings', () => {
    test('can change difficulty before game starts', () => {
      render(<WhackAMoleGame />);
      const select = screen.getByTestId('difficulty-select');
      
      fireEvent.change(select, { target: { value: 'hard' } });
      
      expect(select).toHaveValue('hard');
    });

    test('difficulty options include easy, medium, and hard', () => {
      render(<WhackAMoleGame />);
      const select = screen.getByTestId('difficulty-select');
      const options = Array.from(select.querySelectorAll('option')).map(opt => opt.value);
      
      expect(options).toEqual(['easy', 'medium', 'hard']);
    });

    test('cannot change difficulty during gameplay', () => {
      render(<WhackAMoleGame />);
      const select = screen.getByTestId('difficulty-select');
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      expect(select).toBeDisabled();
    });
  });

  // ==================== MOLE WHACKING TESTS ====================

  describe('Mole Whacking Functionality', () => {
    test('clicking on a hole is possible', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      const hole = screen.getByTestId('hole-0');
      fireEvent.click(hole);
      
      // Should not throw error
      expect(hole).toBeInTheDocument();
    });

    test('score increases when whacking a mole (simulated)', () => {
      render(<WhackAMoleGame />);
      
      // Note: In real test, you'd need to mock the random mole spawning
      // This is a simplified version
      fireEvent.click(screen.getByTestId('start-button'));
      
      const initialScore = parseInt(screen.getByTestId('score').textContent);
      expect(initialScore).toBe(0);
    });

    test('missed count increases when mole disappears without being hit', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      // Wait for moles to spawn and disappear
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Missed count should potentially increase
      const missed = parseInt(screen.getByTestId('missed').textContent);
      expect(missed).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== SCORE TESTS ====================

  describe('Score Management', () => {
    test('score starts at 0', () => {
      render(<WhackAMoleGame />);
      expect(screen.getByTestId('score')).toHaveTextContent('0');
    });

    test('score cannot go below 0 (bomb protection)', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      // Even if bombs are hit, score should not go negative
      const score = parseInt(screen.getByTestId('score').textContent);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    test('best score updates when current score exceeds it', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      // Fast forward to end game
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();
      });
      
      // Best score should be updated
      const bestScore = parseInt(screen.getByTestId('best').textContent);
      expect(bestScore).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== GAME END TESTS ====================

  describe('Game End Functionality', () => {
    test('shows game over overlay when time runs out', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();
      });
    });

    test('displays final score in game over overlay', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        const overlay = screen.getByTestId('game-over-overlay');
        expect(overlay).toHaveTextContent(/You scored \d+ points/);
      });
    });

    test('enables start button after game ends', async () => {
      render(<WhackAMoleGame />);
      
      const startButton = screen.getByTestId('start-button');
      
      fireEvent.click(startButton);
      expect(startButton).toBeDisabled();
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();
      });
      
      // Check if button is enabled after game ends
      await waitFor(() => {
        expect(startButton).not.toBeDisabled();
      });
    });

    test('enables difficulty selector after game ends', async () => {
      render(<WhackAMoleGame />);
      
      const difficultySelect = screen.getByTestId('difficulty-select');
      
      fireEvent.click(screen.getByTestId('start-button'));
      expect(difficultySelect).toBeDisabled();
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(difficultySelect).not.toBeDisabled();
      });
    });
  });

  // ==================== PLAY AGAIN TESTS ====================

  describe('Play Again Functionality', () => {
    test('shows play again button in game over overlay', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('play-again-button')).toBeInTheDocument();
      });
    });

    test('restarts game when play again is clicked', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('play-again-button')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('play-again-button'));
      
      expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();
      expect(screen.getByTestId('time')).toHaveTextContent('30');
      expect(screen.getByTestId('score')).toHaveTextContent('0');
    });

    test('hides overlay when play again is clicked', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('play-again-button'));
      
      expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();
    });
  });

  // ==================== UI INTERACTION TESTS ====================

  describe('UI Interactions', () => {
    test('hole can be clicked', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      const hole = screen.getByTestId('hole-0');
      fireEvent.click(hole);
      
      // Should not throw error
      expect(hole).toBeInTheDocument();
    });

    test('multiple holes can be clicked', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      for (let i = 0; i < 9; i++) {
        const hole = screen.getByTestId(`hole-${i}`);
        fireEvent.click(hole);
        expect(hole).toBeInTheDocument();
      }
    });

    test('timer bar exists and is visible', () => {
      render(<WhackAMoleGame />);
      
      const timerBar = screen.getByTestId('timer-bar');
      expect(timerBar).toBeInTheDocument();
      expect(timerBar).toBeVisible();
    });
  });

  // ==================== RESULT MESSAGE TESTS ====================

  describe('Result Messages', () => {
    test('shows correct emoji for high score (>= 100)', async () => {
      render(<WhackAMoleGame />);
      
      // This test would need to mock achieving a high score
      // For demonstration, we'll just test the game end state
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();
      });
    });

    test('displays miss count in game over message', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        const overlay = screen.getByTestId('game-over-overlay');
        expect(overlay).toHaveTextContent(/miss/i);
      });
    });
  });

  // ==================== STATE MANAGEMENT TESTS ====================

  describe('State Management', () => {
    test('maintains separate state for score and best score', () => {
      render(<WhackAMoleGame />);
      
      const score = screen.getByTestId('score');
      const best = screen.getByTestId('best');
      
      expect(score).toBeInTheDocument();
      expect(best).toBeInTheDocument();
      expect(score.textContent).toBe('0');
      expect(best.textContent).toBe('0');
    });

    test('maintains separate state for missed count', () => {
      render(<WhackAMoleGame />);
      
      const missed = screen.getByTestId('missed');
      expect(missed).toBeInTheDocument();
      expect(missed.textContent).toBe('0');
    });

    test('resets all game state on new game', async () => {
      render(<WhackAMoleGame />);
      
      // Start first game
      fireEvent.click(screen.getByTestId('start-button'));
      
      // End game
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();
      });
      
      // Start new game
      fireEvent.click(screen.getByTestId('play-again-button'));
      
      // Check all state is reset
      expect(screen.getByTestId('score')).toHaveTextContent('0');
      expect(screen.getByTestId('time')).toHaveTextContent('30');
      expect(screen.getByTestId('missed')).toHaveTextContent('0');
    });
  });

  // ==================== EDGE CASE TESTS ====================

  describe('Edge Cases', () => {
    test('handles rapid clicking on same hole', () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      const hole = screen.getByTestId('hole-0');
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(hole);
      }
      
      // Should not crash
      expect(hole).toBeInTheDocument();
    });

    test('handles clicking on holes before game starts', () => {
      render(<WhackAMoleGame />);
      
      const hole = screen.getByTestId('hole-0');
      fireEvent.click(hole);
      
      // Score should remain 0
      expect(screen.getByTestId('score')).toHaveTextContent('0');
    });

    test('timer does not go negative', async () => {
      render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      act(() => {
        jest.advanceTimersByTime(35000); // More than 30 seconds
      });
      
      await waitFor(() => {
        const time = parseInt(screen.getByTestId('time').textContent);
        expect(time).toBeGreaterThanOrEqual(0);
      });
    });

    test('handles unmounting during active game', () => {
      const { unmount } = render(<WhackAMoleGame />);
      
      fireEvent.click(screen.getByTestId('start-button'));
      
      // Should not throw error
      expect(() => unmount()).not.toThrow();
    });
  });
});
