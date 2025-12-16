import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/*
Ocean Professional Theme Colors:
primary:   #2563EB
secondary: #F59E0B
success:   #F59E0B
error:     #EF4444
gradient:  from-blue-500/10 to-gray-50 (use softened blue top-fade to white/gray as background)
background:#f9fafb
surface:   #ffffff
text:      #111827
*/

/**
 * PUBLIC_INTERFACE
 * Main React functional component for Tic Tac Toe.
 * Implements local 2 player game, game state, running scores, and accessible, modern UI with theme colors.
 */
function App() {
  // Constants for players
  const PLAYER_X = "X";
  const PLAYER_O = "O";
  const EMPTY_BOARD = Array(9).fill(null);

  // Local state management
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [xIsNext, setXIsNext] = useState(true); // true = X's turn, false = O's turn
  const [status, setStatus] = useState("playing"); // "playing", "won", "draw"
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });
  const [lastStart, setLastStart] = useState(PLAYER_X); // For alternating first player

  // Accessibility: manage focus when game ends for keyboard flow
  const winnerAnnouncementRef = useRef(null);

  // Winning combinations
  const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  // Check win/draw after every move
  useEffect(() => {
    const winnerSymbol = calculateWinner(board);
    if (winnerSymbol) {
      setStatus("won");
      setWinner(winnerSymbol);
      setScores((prev) => ({ ...prev, [winnerSymbol]: prev[winnerSymbol] + 1 }));
      // Accessibility: Move focus to winner announcement
      setTimeout(() => {
        if (winnerAnnouncementRef.current) winnerAnnouncementRef.current.focus();
      }, 125);
    } else if (board.every((cell) => cell)) {
      setStatus("draw");
      setScores((prev) => ({ ...prev, D: prev.D + 1 }));
    } else {
      setStatus("playing");
      setWinner(null);
    }
    // eslint-disable-next-line
  }, [board]);

  // PUBLIC_INTERFACE
  function handleClick(index) {
    // Only allow move if cell empty and game ongoing
    if (board[index] || status !== "playing") return;
    const copy = board.slice();
    copy[index] = xIsNext ? PLAYER_X : PLAYER_O;
    setBoard(copy);
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function resetBoard() {
    // Alternate the starting player for fairness
    const nextStart = lastStart === PLAYER_X ? PLAYER_O : PLAYER_X;
    setBoard(EMPTY_BOARD);
    setXIsNext(nextStart === PLAYER_X);
    setStatus("playing");
    setWinner(null);
    setLastStart(nextStart);
    // For accessibility, return keyboard focus to top of board after reset
    setTimeout(() => {
      const firstButton = document.querySelector('.ttt-cell[tabindex="0"]');
      if (firstButton) firstButton.focus();
    }, 80);
  }

  // PUBLIC_INTERFACE
  function newGame() {
    // Resets everything including scores
    setScores({ X: 0, O: 0, D: 0 });
    setLastStart(PLAYER_O); // Start next fresh game as O, will alternate to X on first resetBoard call
    resetBoard();
  }

  // PUBLIC_INTERFACE
  function getGameStatusMessage() {
    if (status === "won")
      return (
        <span
          className="status-win"
          role="alert"
          tabIndex={-1}
          ref={winnerAnnouncementRef}
          aria-live="assertive"
        >
          🎉 Winner: <span className={`ttt-xo ttt-${winner}`}>{winner}</span>
        </span>
      );
    if (status === "draw")
      return (
        <span className="status-draw" role="alert" aria-live="assertive">
          🤝 It's a Draw!
        </span>
      );
    return (
      <span>
        Next Turn:&nbsp;
        <span className={`ttt-xo ttt-${xIsNext ? "X" : "O"}`}>
          {xIsNext ? PLAYER_X : PLAYER_O}
        </span>
      </span>
    );
  }

  // PUBLIC_INTERFACE
  function calculateWinner(bd) {
    // Returns X, O, or null.
    for (let [a, b, c] of WIN_LINES) {
      if (
        bd[a] &&
        bd[a] === bd[b] &&
        bd[a] === bd[c]
      ) {
        return bd[a];
      }
    }
    return null;
  }

  // Keyboard accessibility: Enable arrow navigation for board grid
  function handleCellKeyDown(e, idx) {
    if (status !== "playing") return; // Don't move/focus after game over
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    if (e.key === "Enter" || e.key === " ") {
      // Space/Enter places piece
      handleClick(idx);
    } else if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      let next = idx;
      if (e.key === "ArrowRight") next = col < 2 ? idx + 1 : idx - 2;
      if (e.key === "ArrowLeft") next = col > 0 ? idx - 1 : idx + 2;
      if (e.key === "ArrowDown") next = row < 2 ? idx + 3 : idx - 6;
      if (e.key === "ArrowUp") next = row > 0 ? idx - 3 : idx + 6;
      const nextBtn = document.querySelector(`.ttt-cell[data-idx="${next}"]`);
      if (nextBtn) nextBtn.focus();
    }
  }

  // CSS inline gradient for background
  const gradientBg = {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(150deg, #2563EB18 0%, #f9fafb 80%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  };

  return (
    <div style={gradientBg}>
      <main className="ttt-main-card" aria-label="Tic Tac Toe Game Board">
        {/* Header */}
        <h1 className="ttt-header" tabIndex={0}>
          Tic Tac Toe
        </h1>

        {/* Scoreboard */}
        <section className="ttt-scoreboard" aria-label="Scores">
          <ScoreBox label="X Wins" value={scores.X} color="primary" />
          <ScoreBox label="Draws" value={scores.D} color="secondary" />
          <ScoreBox label="O Wins" value={scores.O} color="primary" invert />
        </section>

        {/* Game status (current turn or win/draw) */}
        <div className="ttt-status" aria-live="polite">
          {getGameStatusMessage()}
        </div>

        {/* Game Board */}
        <section
          className="ttt-board"
          role="grid"
          aria-label="Tic Tac Toe Board"
        >
          {board.map((cell, idx) => (
            <button
              key={idx}
              className={`ttt-cell${cell ? " ttt-filled" : ""}${
                status !== "playing" ? " ttt-cell-highlight" : ""
              }`}
              data-idx={idx}
              tabIndex={cell || status !== "playing" ? -1 : 0}
              aria-label={
                cell
                  ? `Cell ${idx + 1} occupied by ${cell}`
                  : `Empty cell ${idx + 1}, ${
                      xIsNext ? "X" : "O"
                    }'s move`
              }
              role="gridcell"
              aria-disabled={!!cell || status !== "playing"}
              disabled={!!cell || status !== "playing"}
              onClick={() => handleClick(idx)}
              onKeyDown={(e) => handleCellKeyDown(e, idx)}
              style={{animationDelay: `${idx * 0.02}s`}}
            >
              {cell && (
                <span
                  className={`ttt-xo ttt-${cell}`}
                >
                  {cell}
                </span>
              )}
            </button>
          ))}
        </section>

        {/* Controls */}
        <section className="ttt-controls">
          <button
            className="ttt-btn ttt-btn-primary"
            onClick={resetBoard}
            aria-label="Reset Board"
            type="button"
          >
            Reset Board
          </button>
          <button
            className="ttt-btn ttt-btn-secondary"
            onClick={newGame}
            aria-label="New Game (Reset Scores)"
            type="button"
          >
            New Game
          </button>
        </section>
      </main>
      {/* App credit/footer */}
      <footer className="ttt-footer">
        <a
          href="https://reactjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="ttt-footer-link"
        >
          Built with React • Ocean Professional Theme
        </a>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
function ScoreBox({ label, value, color, invert }) {
  // Score display box for each category
  const background =
    color === "primary"
      ? invert
        ? "var(--ocscore-invert)"
        : "var(--ocscore)"
      : "var(--ocdraw)";
  const textColor =
    color === "primary"
      ? invert
        ? "#FFF"
        : "#111827"
      : "#FFF";
  return (
    <div
      className="ttt-scorebox"
      style={{
        background,
        color: textColor,
      }}
      aria-label={`${label}: ${value}`}
    >
      <span className="ttt-scorelabel">{label}</span>
      <span className="ttt-scoreval">{value}</span>
    </div>
  );
}

export default App;
