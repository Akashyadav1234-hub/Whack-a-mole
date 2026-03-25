import React from 'react';
import { createRoot } from 'react-dom/client';
import WhackAMoleGame from './WhackAMoleGame';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <WhackAMoleGame />
  </React.StrictMode>
);