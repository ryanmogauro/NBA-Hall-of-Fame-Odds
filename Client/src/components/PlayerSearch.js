import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PlayerSearch.css';

// API configuration
const API_KEY = 'f0cd23a225mshffaa1235925387bp101584jsn2744ef5e9285';
const host = 'api-nba-v1.p.rapidapi.com';


function PlayerSearch() {
  const [players, setPlayers] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      if (query.length >= 3) {
        try {
          const response = await axios.get('https://api-nba-v1.p.rapidapi.com/players', {
            headers: {
              'x-rapidapi-key': API_KEY,
              'x-rapidapi-host': host,
              'Content-Type':'application/json'
            },
            params: {
              search: query
            }
          });
          const transformedPlayers = response.data.response.map(player => ({
            id: player.id,
            name: `${player.firstname} ${player.lastname}`
          }));
          
          setPlayers(transformedPlayers);
          
        } catch (error) {
          console.error('Error fetching player data:', error);
        }
      } else {
        setPlayers([]);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchPlayers();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    setFilteredPlayers(
      players.filter(player => player.name.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, players]);

  const handlePlayerClick = player => {
    navigate(`/player-stats/${encodeURIComponent(player.name)}`, { state: { player } });
  };
 
  return (
    <div className="search-container">
      <h1 className="title">NBA Player Search</h1>
      <div>
        <input
          className="search-input"
          type="text"
          placeholder="Enter player's name"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {filteredPlayers.length > 0 && (
          <ul className="player-list">
            {filteredPlayers.map(player => (
              <li 
                key={player.id} 
                className="player-item"
                onClick={() => handlePlayerClick(player)}
              >
                {player.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PlayerSearch;
