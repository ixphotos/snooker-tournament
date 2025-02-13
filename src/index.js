import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SnookerTournament from './SnookerTournament.js';  // Added .js here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SnookerTournament />
  </React.StrictMode>
);