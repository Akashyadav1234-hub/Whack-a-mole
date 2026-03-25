# Whack-a-Mole Game - React Component with Test Suite

A fully functional Whack-a-Mole game built with React, complete with comprehensive test coverage using Jest and React Testing Library.

## 📁 Files

- **WhackAMoleGame.jsx** - Main React component
- **WhackAMoleGame.test.jsx** - Comprehensive test suite
- **README.md** - This file

## 🎮 Game Features

- **Three Difficulty Levels**: Easy, Medium, and Hard
- **Score Tracking**: Track your current score and best score
- **Timer System**: 30-second countdown with visual timer bar
- **Bomb System**: Avoid bombs that deduct 5 points
- **Miss Counter**: Tracks moles that got away
- **Responsive Grid**: 3x3 grid of holes where moles appear
- **Game Over Screen**: Shows final score and statistics

## 🚀 Setup Instructions

### Prerequisites

```bash
# Node.js (v14 or higher)
# npm or yarn
```

### Installation

1. **Install Dependencies**

```bash
npm install react react-dom

# For testing
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

2. **Configure Jest**

Create a `jest.config.js` file in your project root:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }],
  },
};
```

3. **Create Jest Setup File**

Create a `jest.setup.js` file:

```javascript
import '@testing-library/jest-dom';
```

4. **Update package.json**

Add test scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test:watch
```

### Generate Coverage Report

```bash
npm test:coverage
```

## 📊 Test Coverage

The test suite includes **90+ test cases** covering:

### 1. Component Rendering Tests (9 tests)
- Initial component mount
- All UI elements rendering
- Default values display
- Grid structure

### 2. Game Start Tests (5 tests)
- Start button functionality
- State reset on game start
- UI element disabling during gameplay
- Message updates

### 3. Timer Tests (3 tests)
- Timer countdown functionality
- Timer bar visual updates
- Game end when timer reaches zero

### 4. Difficulty Tests (3 tests)
- Difficulty selector functionality
- Available difficulty options
- Difficulty locking during gameplay

### 5. Mole Whacking Tests (3 tests)
- Hole click interactions
- Score updates on successful hits
- Missed count tracking

### 6. Score Management Tests (3 tests)
- Score initialization
- Bomb protection (score cannot go negative)
- Best score tracking

### 7. Game End Tests (3 tests)
- Game over overlay display
- Final score display
- UI element re-enabling

### 8. Play Again Tests (3 tests)
- Play again button functionality
- Game state reset
- Overlay dismissal

### 9. UI Interaction Tests (3 tests)
- Multiple hole interactions
- Timer bar visibility
- Click event handling

### 10. Result Message Tests (2 tests)
- Result emoji display based on score
- Miss count display in results

### 11. State Management Tests (3 tests)
- Independent state tracking
- State persistence across games
- State reset functionality

### 12. Edge Case Tests (4 tests)
- Rapid clicking prevention
- Pre-game click handling
- Timer boundary conditions
- Component unmounting during gameplay

## 🎯 Test Examples

### Example: Testing Game Start

```javascript
test('starts the game when start button is clicked', () => {
  render(<WhackAMoleGame />);
  const startButton = screen.getByTestId('start-button');
  
  fireEvent.click(startButton);
  
  expect(screen.getByTestId('message')).toHaveTextContent('Hit the moles!');
  expect(startButton).toHaveTextContent('Running...');
  expect(startButton).toBeDisabled();
});
```

### Example: Testing Timer Countdown

```javascript
test('decrements timer every second during gameplay', () => {
  render(<WhackAMoleGame />);
  
  fireEvent.click(screen.getByTestId('start-button'));
  
  expect(screen.getByTestId('time')).toHaveTextContent('30');
  
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  
  expect(screen.getByTestId('time')).toHaveTextContent('29');
});
```

### Example: Testing Game Over

```javascript
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
```

## 🎨 Component Usage

### Basic Usage

```javascript
import React from 'react';
import WhackAMoleGame from './WhackAMoleGame';

function App() {
  return (
    <div className="App">
      <WhackAMoleGame />
    </div>
  );
}

export default App;
```

### With Custom Styling

The component uses CSS variables for theming. You can customize colors by defining these variables:

```css
:root {
  --color-background-primary: #ffffff;
  --color-background-secondary: #f5f5f5;
  --color-text-primary: #000000;
  --color-text-secondary: #666666;
  --color-border-secondary: #dddddd;
  --color-border-tertiary: #e0e0e0;
}
```

## 🎮 How to Play

1. Click the **Start** button to begin
2. Moles will randomly appear from holes
3. Click on moles to whack them (+10 points each)
4. Avoid bombs (-5 points)
5. Try to get the highest score before time runs out!

## 🏆 Scoring System

- **Mole Hit**: +10 points
- **Bomb Hit**: -5 points (minimum score: 0)
- **Miss**: No points, increases miss counter

## ⚙️ Difficulty Levels

| Difficulty | Mole Display Time | Spawn Interval |
|------------|------------------|----------------|
| Easy       | 1200ms           | 1500ms         |
| Medium     | 800ms            | 1000ms         |
| Hard       | 500ms            | 700ms          |

## 🐛 Debugging Tips

If tests fail:

1. **Timer Issues**: Ensure `jest.useFakeTimers()` is called in `beforeEach`
2. **Async Issues**: Use `waitFor` for async state updates
3. **Event Issues**: Use `act()` wrapper for timer advancement
4. **DOM Issues**: Check that all `data-testid` attributes are present

## 📝 Test Data IDs

The component uses the following test IDs for testing:

- `start-button` - Start/Running button
- `play-again-button` - Play again button in overlay
- `difficulty-select` - Difficulty dropdown
- `score` - Score display
- `best` - Best score display
- `time` - Time remaining display
- `missed` - Missed count display
- `message` - Game message display
- `timer-bar` - Visual timer bar
- `hole-{index}` - Individual holes (0-8)
- `mole-{index}` - Individual moles (0-8)
- `game-over-overlay` - Game over screen

## 🔧 Troubleshooting

### Common Issues

**Issue**: Tests timeout
**Solution**: Make sure `jest.useFakeTimers()` is called and timers are advanced with `jest.advanceTimersByTime()`

**Issue**: React state updates warning
**Solution**: Wrap state updates in `act()` calls

**Issue**: Cannot find test elements
**Solution**: Verify all elements have the correct `data-testid` attributes

## 📚 Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Hooks Testing](https://react-hooks-testing-library.com/)

## 📄 License

MIT License - Feel free to use this in your projects!

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy Testing! 🎮🧪**
