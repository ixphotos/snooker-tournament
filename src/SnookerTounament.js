// src/SnookerTournament.js
import React, { useState, useEffect } from 'react';

const SnookerTournament = () => {
  // Initial players - you can change these names
  const initialPlayers = ['Matt', 'Ian', 'Tom', 'Peter', 'Gareth', 'Eliott'];
  
  // Generate all possible matches
  const generateMatches = () => {
    const matches = [];
    for (let i = 0; i < initialPlayers.length; i++) {
      for (let j = i + 1; j < initialPlayers.length; j++) {
        matches.push({
          player1: initialPlayers[i],
          player2: initialPlayers[j],
          frames: [
            { player1Score: '', player2Score: '' },
            { player1Score: '', player2Score: '' },
            { player1Score: '', player2Score: '' }
          ],
          highBreak: '',
          highBreakPlayer: ''
        });
      }
    }
    return matches;
  };

  // Load saved data or use initial data
  const [matches, setMatches] = useState(() => {
    const savedMatches = localStorage.getItem('snookerMatches');
    return savedMatches ? JSON.parse(savedMatches) : generateMatches();
  });

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem('snookerMatches', JSON.stringify(matches));
  }, [matches]);

  // Reset tournament function
  const resetTournament = () => {
    if (window.confirm('Are you sure you want to reset the tournament? This will clear all scores.')) {
      const newMatches = generateMatches();
      setMatches(newMatches);
    }
  };

  // Export tournament data
  const exportData = () => {
    const dataStr = JSON.stringify(matches, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'snooker-tournament-data.json';
    link.href = url;
    link.click();
  };

  // Import tournament data
  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setMatches(importedData);
          alert('Tournament data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const calculateMatchWinner = (match) => {
    let player1Wins = 0;
    let player2Wins = 0;
    
    match.frames.forEach(frame => {
      if (frame.player1Score > frame.player2Score) player1Wins++;
      if (frame.player2Score > frame.player1Score) player2Wins++;
    });
    
    if (player1Wins > player2Wins) return match.player1;
    if (player2Wins > player1Wins) return match.player2;
    return 'Draw';
  };

  const calculateStandings = () => {
    const standings = {};
    initialPlayers.forEach(player => {
      standings[player] = { matchPoints: 0, highBreaks: 0 };
    });

    matches.forEach(match => {
      const winner = calculateMatchWinner(match);
      if (winner !== 'Draw') {
        standings[winner].matchPoints += 3;
      }
      if (match.highBreakPlayer) {
        standings[match.highBreakPlayer].highBreaks += 1;
      }
    });

    return Object.entries(standings)
      .map(([player, points]) => ({
        player,
        total: points.matchPoints + points.highBreaks,
        matchPoints: points.matchPoints,
        highBreaks: points.highBreaks
      }))
      .sort((a, b) => b.total - a.total);
  };

  const handleScoreChange = (matchIndex, frameIndex, player, value) => {
    const newMatches = [...matches];
    newMatches[matchIndex].frames[frameIndex][`${player}Score`] = value;
    setMatches(newMatches);
  };

  const handleHighBreakChange = (matchIndex, value, player) => {
    const newMatches = [...matches];
    newMatches[matchIndex].highBreak = value;
    newMatches[matchIndex].highBreakPlayer = player;
    setMatches(newMatches);
  };

  const standings = calculateStandings();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex gap-4">
        <button 
          onClick={resetTournament}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reset Tournament
        </button>
        <button 
          onClick={exportData}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Export Data
        </button>
        <input
          type="file"
          accept=".json"
          onChange={importData}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Tournament Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Player</th>
                <th className="p-2 text-right">Match Points</th>
                <th className="p-2 text-right">High Breaks</th>
                <th className="p-2 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <tr 
                  key={standing.player} 
                  className={`border-b ${index < 3 ? 'bg-gray-50' : ''}`}
                >
                  <td className="p-2 font-medium">{index + 1}</td>
                  <td className="p-2">{standing.player}</td>
                  <td className="p-2 text-right">{standing.matchPoints}</td>
                  <td className="p-2 text-right">{standing.highBreaks}</td>
                  <td className="p-2 text-right font-medium">{standing.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Match Results</h2>
        <div className="space-y-6">
          {matches.map((match, matchIndex) => (
            <div key={matchIndex} className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">{match.player1} vs {match.player2}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {match.frames.map((frame, frameIndex) => (
                  <div key={frameIndex} className="border rounded p-3">
                    <div className="text-sm font-medium mb-2">Frame {frameIndex + 1}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm mb-1">{match.player1}</label>
                        <input
                          type="number"
                          className="w-full border rounded p-1"
                          value={frame.player1Score}
                          onChange={(e) => handleScoreChange(matchIndex, frameIndex, 'player1', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{match.player2}</label>
                        <input
                          type="number"
                          className="w-full border rounded p-1"
                          value={frame.player2Score}
                          onChange={(e) => handleScoreChange(matchIndex, frameIndex, 'player2', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">High Break</label>
                  <input
                    type="number"
                    className="w-full border rounded p-1"
                    value={match.highBreak}
                    onChange={(e) => handleHighBreakChange(matchIndex, e.target.value, match.highBreakPlayer)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">High Break Player</label>
                  <select
                    className="w-full border rounded p-1"
                    value={match.highBreakPlayer}
                    onChange={(e) => handleHighBreakChange(matchIndex, match.highBreak, e.target.value)}
                  >
                    <option value="">Select player</option>
                    <option value={match.player1}>{match.player1}</option>
                    <option value={match.player2}>{match.player2}</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SnookerTournament;