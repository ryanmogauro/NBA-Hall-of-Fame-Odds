import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PlayerSearch from './components/PlayerSearch';
import PlayerStats from './components/PlayerStats';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<PlayerSearch />} />
          <Route path ="/player-stats/:playerId" element={<PlayerStats />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;