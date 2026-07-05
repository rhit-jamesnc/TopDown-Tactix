import './ActiveGamesModal.css';

export const ActiveGamesModal = () => {
  // Mock data for layout testing. We will replace this with real state/polling later.
  const mockGames = [
    { id: '1', players: 'Player1 vs Player2', status: 'online' },
    { id: '2', players: 'Player3 vs AI (Reserves)', status: 'offline' },
    { id: '3', players: 'Player4 vs Player5', status: 'online' },
    { id: '4', players: 'Player6 vs Player7', status: 'online' },
    { id: '5', players: 'Player8 vs AI (Academy)', status: 'offline' },
    { id: '6', players: 'Player9 vs Player10', status: 'online' },
    { id: '7', players: 'Player11 vs AI (First-Team)', status: 'offline' },
  ];

  return (
    <div className="active-games-container">
      {mockGames.map(game => (
        <div key={game.id} className="active-game-card">
          <div className="game-info">
            <span className={`status-indicator ${game.status}`}></span>
            <h4>{game.players}</h4>
          </div>
          <div className="game-actions">
            <button className="details-btn">Details</button>
            <button className="stop-btn">Force Stop</button>
          </div>
        </div>
      ))}
    </div>
  );
};