import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';

function PlayerStats() {
  const location = useLocation();
  const { player } = location.state || {};
  const { playerId } = useParams();

  const [stats, setStats] = useState(null);
  const [probability, setProbability] = useState(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/player-stats/${playerId}`);
        setStats(response.data.modelInput);
        setProbability(response.data.probability);
      } catch (error) {
        console.error('Error fetching player stats:', error);
      }
    };

    if (playerId) {
      fetchPlayerStats();
    }
  }, [playerId]);

  return (
    <div className="player-stats-container" style={styles.container}>
      {stats ? (
        <div className="player-stats" style={styles.statsWrapper}>
          <h1 className="player-name" style={styles.playerName}>{player.name} Stats</h1>
          <div className="stats-grid" style={styles.statsGrid}>
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="stat-item" style={styles.statItem}>
                <span className="stat-label" style={styles.statLabel}>{key}:</span>
                <span className="stat-value" style={styles.statValue}>
                  {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(2) : value}
                </span>
              </div>
            ))}
          </div>
          <div className="hof-probability" style={styles.hofProbability}>
            <h2 style={styles.h2}>Hall of Fame Probability</h2>
            <div className="probability-bar" style={styles.probabilityBar}>
              <div 
                className="probability-fill" 
                style={{ 
                  ...styles.probabilityFill,
                  width: `${probability * 100}%` 
                }}
              ></div>
            </div>
            <span className="probability-value" style={styles.probabilityValue}>
              {(probability * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      ) : (
        <p className="loading" style={styles.loading}>Loading stats...</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f0f0f0',
  },
  statsWrapper: {
    maxWidth: '800px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  playerName: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
  },
  statLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  statValue: {
    color: '#333',
  },
  hofProbability: {
    textAlign: 'center',
  },
  h2: {
    marginBottom: '10px',
    color: '#333',
    fontSize: '20px',
  },
  probabilityBar: {
    width: '100%',
    height: '20px',
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  probabilityFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.5s ease-in-out',
  },
  probabilityValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#666',
  },
};

export default PlayerStats;

