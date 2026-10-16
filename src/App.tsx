import { useEffect, useRef, useState } from 'react';
import { initWizardChess } from './wizardChessEngine.js';

export default function App() {
  const initializedRef = useRef(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initWizardChess();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSheetOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRestoreUI = () => {
    const win = window as unknown as { wizardChess?: { toggleUI?: (force?: boolean) => void } };
    if (win.wizardChess?.toggleUI) {
      win.wizardChess.toggleUI(false);
    } else {
      document.body.classList.remove('cinematic-ui-hidden');
      const btnHide = document.getElementById('btn-hide-ui');
      if (btnHide) btnHide.textContent = 'Hide UI [H]';
    }
  };

  return (
    <>
      <div id="loading-overlay">
        <div className="loader-title">Wizard Chess</div>
        <div className="loader-bar-wrap">
          <div className="loader-bar" id="loader-bar"></div>
        </div>
        <div id="loader-text">Summoning Sanctum Architecture &amp; Sculpted Pieces...</div>
      </div>

      <div id="canvas-container"></div>

      <button
        type="button"
        className="hud-btn mobile-only-restore-ui"
        id="btn-mobile-show-ui"
        onClick={handleRestoreUI}
        title="Show HUD Controls"
      >
        Show UI
      </button>

      <div id="hud-top">
        <div className="hud-group" id="hud-left">
          <div className="brand-pill">
            <span className="brand-title">Wizard Chess</span>
          </div>
          <div className="status-pill" id="status-pill">
            <span className="turn-dot" id="turn-dot"></span>
            <span id="turn-text">White to Move</span>
            <span className="mode-badge" id="mode-badge">Playing as White</span>
          </div>
        </div>

        <button
          type="button"
          className={`hud-btn mobile-controls-trigger ${mobileSheetOpen ? 'active' : ''}`}
          id="btn-mobile-controls"
          aria-expanded={mobileSheetOpen}
          aria-controls="hud-right"
          onClick={() => setMobileSheetOpen((prev) => !prev)}
        >
          {mobileSheetOpen ? 'Close' : 'Controls'}
        </button>

        <div
          className={`mobile-sheet-backdrop ${mobileSheetOpen ? 'open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setMobileSheetOpen(false);
          }}
          aria-hidden="true"
        ></div>

        <div
          className={`hud-group ${mobileSheetOpen ? 'mobile-sheet-open' : ''}`}
          id="hud-right"
        >
          <div
            className="mobile-sheet-handle-wrap"
            onClick={(e) => {
              e.stopPropagation();
              setMobileSheetOpen(false);
            }}
            aria-hidden="true"
          >
            <div className="mobile-sheet-handle"></div>
          </div>

          <div className="mobile-sheet-header">
            <span className="mobile-sheet-title">Controls</span>
            <button
              type="button"
              className="mobile-sheet-close"
              id="btn-mobile-sheet-close"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSheetOpen(false);
              }}
              aria-label="Close Controls"
            >
              Close ✕
            </button>
          </div>

          <div className="mobile-sheet-section-label">Match Mode &amp; Elo</div>

          <button
            type="button"
            className="hud-btn primary"
            id="btn-pregame-open"
            title="Open Game Mode & Match Setup (Single Player AI / 1v1 In-Person)"
            onClick={() => setMobileSheetOpen(false)}
          >
            ⚙ Setup
          </button>

          <button
            className="hud-btn mode-btn"
            id="btn-mode-toggle"
            title="Toggle between AI Match and 1v1 In-Person Play (Shortcut: 1 / 2)"
          >
            Mode: AI Match
          </button>

          <div className="hud-select-wrap" id="difficulty-wrap">
            <label htmlFor="select-ai-difficulty" className="hud-label">AI Difficulty:</label>
            <select
              id="select-ai-difficulty"
              className="hud-select"
              defaultValue="3200"
              title="Stockfish AI Engine Elo Difficulty"
            >
              <option value="3200">3200 Elo — Grandmaster Engine God</option>
              <option value="2800">2800 Elo — High Altar Master</option>
              <option value="2400">2400 Elo — Grand Magus</option>
              <option value="2000">2000 Elo — Archmage</option>
              <option value="1600">1600 Elo — Sanctum Knight</option>
              <option value="1200">1200 Elo — Acolyte</option>
              <option value="800">800 Elo — Novice Apprentice</option>
            </select>
          </div>

          <button
            className="hud-btn"
            id="btn-cam-autoflip"
            title="Auto-flip camera view to current player's side each turn in 1v1 In-Person"
            style={{ display: 'none' }}
          >
            Auto-Flip Cam: ON
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">Game Actions &amp; Tactics</div>

          <button
            className="hud-btn suggestion-glow-btn"
            id="btn-suggestion"
            title="Consult 3200 Elo Stockfish Engine for the optimal move recommendation (Shortcut: S)"
            onClick={() => setMobileSheetOpen(false)}
          >
            ✦ Suggestion (3200)
          </button>
          <button
            className="hud-btn"
            id="btn-undo"
            title="Undo the last chess move (Shortcut: Z or Ctrl+Z)"
            onClick={() => setMobileSheetOpen(false)}
          >
            Undo Move
          </button>
          <button
            className="hud-btn"
            id="btn-side-toggle"
            title="Switch between Playing as White and Playing as Black (or Flip Board in 1v1)"
            onClick={() => setMobileSheetOpen(false)}
          >
            Play as Black
          </button>
          <button
            className="hud-btn"
            id="btn-ai-move"
            title="Let the AI make the next move immediately"
            onClick={() => setMobileSheetOpen(false)}
          >
            AI Move
          </button>
          <button
            className="hud-btn"
            id="btn-reset"
            title="Start a fresh game on the altar"
            onClick={() => setMobileSheetOpen(false)}
          >
            New Game
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">
            <span>Camera Views</span>
            <span className="mobile-sheet-section-sub">Tap active view to flip</span>
          </div>

          <button
            className="hud-btn active"
            id="btn-cam-player"
            title="Player Camera (Click again to flip White / Black view)"
          >
            Player Cam
          </button>
          <button
            className="hud-btn"
            id="btn-cam-top"
            title="Overhead Board View (Click again to flip White / Black orientation)"
          >
            Overhead
          </button>
          <button
            className="hud-btn"
            id="btn-cam-side"
            title="Side Profile View (Click again to switch East / West side)"
          >
            Side
          </button>
          <button
            className="hud-btn"
            id="btn-cam-wide"
            title="Wide Cathedral View (Click again to switch North Rose / South Narthex)"
          >
            Cathedral
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">Display &amp; Gestures</div>

          <button
            className="hud-btn"
            id="btn-hide-ui"
            title="Toggle HUD visibility (Shortcut: H)"
            onClick={() => setMobileSheetOpen(false)}
          >
            Hide UI [H]
          </button>

          <div className="mobile-sheet-hint">
            <strong>Touch:</strong> Tap Piece to Move &nbsp;•&nbsp; 1-Finger Drag: Orbit &nbsp;•&nbsp; 2-Finger Drag: Pan &nbsp;•&nbsp; Pinch: Zoom
          </div>
        </div>
      </div>

      <div id="suggestion-pill" className="suggestion-pill" style={{ display: 'none' }}></div>

      <div id="hud-bottom">
        <div className="hint-pill" id="controls-hint">
          <strong>Controls:</strong> Click Piece to Move &nbsp;•&nbsp; Suggestion [S] &nbsp;•&nbsp; Undo [Z] &nbsp;•&nbsp; F: Flip Cam &nbsp;•&nbsp; 1/2: AI / 1v1 &nbsp;•&nbsp; Left-Drag: Orbit &nbsp;•&nbsp; Right-Drag: Pan &nbsp;•&nbsp; Scroll: Zoom &nbsp;•&nbsp; H: Hide UI
        </div>
        <div className="captured-pill" id="captured-tray"></div>
      </div>

      {/* Pre-Game Setup Modal Screen */}
      <div id="pregame-screen" className="pregame-overlay" role="dialog" aria-modal="true" aria-labelledby="pregame-title">
        <div className="pregame-modal">
          <button type="button" className="pregame-close-btn" id="btn-pregame-close" aria-label="Close match setup">
            ✕
          </button>
          <div className="pregame-ornament">✦ &nbsp; SANCTUM BATTLE SETUP &nbsp; ✦</div>
          <h2 className="pregame-title" id="pregame-title">Choose Game Mode</h2>
          <p className="pregame-subtitle">Select your battle format, army allegiance, and Stockfish engine strength</p>

          <div className="pregame-section-label">Select Match Mode</div>
          <div className="pregame-mode-grid">
            <button type="button" className="pregame-mode-card active" id="pregame-mode-ai">
              <div className="pregame-card-icon">⚔️</div>
              <div className="pregame-card-body">
                <div className="pregame-card-title">Single Player vs AI</div>
                <div className="pregame-card-desc">Face the Grandmaster Stockfish engine up to 3200 Elo with sculpted piece duels.</div>
              </div>
              <div className="pregame-card-badge">Stockfish AI</div>
            </button>
            <button type="button" className="pregame-mode-card" id="pregame-mode-local">
              <div className="pregame-card-icon">👥</div>
              <div className="pregame-card-body">
                <div className="pregame-card-title">1v1 In-Person Play</div>
                <div className="pregame-card-desc">Pass &amp; play on the same altar. Camera smoothly auto-rotates to active player.</div>
              </div>
              <div className="pregame-card-badge">Pass &amp; Play</div>
            </button>
          </div>

          {/* Single Player AI Options */}
          <div id="pregame-ai-options" className="pregame-suboptions">
            <div className="pregame-sub-group">
              <label className="pregame-sub-label">Player Army Allegiance</label>
              <div className="pregame-side-pickers">
                <button type="button" className="pregame-side-btn active" id="pregame-side-white">
                  <span className="side-indicator white"></span>
                  <span>Play as White (Moves 1st)</span>
                </button>
                <button type="button" className="pregame-side-btn" id="pregame-side-black">
                  <span className="side-indicator black"></span>
                  <span>Play as Black (Moves 2nd)</span>
                </button>
              </div>
            </div>

            <div className="pregame-sub-group">
              <label htmlFor="pregame-difficulty-select" className="pregame-sub-label">Stockfish Engine Difficulty</label>
              <select id="pregame-difficulty-select" className="pregame-select" defaultValue="3200">
                <option value="3200">3200 Elo — Grandmaster Engine God (Deep Search)</option>
                <option value="2800">2800 Elo — High Altar Master</option>
                <option value="2400">2400 Elo — Grand Magus</option>
                <option value="2000">2000 Elo — Archmage</option>
                <option value="1600">1600 Elo — Sanctum Knight</option>
                <option value="1200">1200 Elo — Acolyte</option>
                <option value="800">800 Elo — Novice Apprentice</option>
              </select>
            </div>
          </div>

          {/* 1v1 In-Person Options */}
          <div id="pregame-local-options" className="pregame-suboptions" style={{ display: 'none' }}>
            <div className="pregame-sub-group">
              <label className="pregame-checkbox-label">
                <input type="checkbox" id="pregame-autoflip-check" defaultChecked={true} />
                <span>Auto-rotate camera 180° when turn changes (Both players view from their own perspective)</span>
              </label>
            </div>
          </div>

          <div className="pregame-actions">
            <button type="button" className="pregame-start-btn" id="btn-pregame-start">
              ✦ &nbsp; Enter Sanctum &amp; Begin Match &nbsp; ✦
            </button>
          </div>
        </div>
      </div>

      <div id="checkmate-overlay" role="status" aria-live="polite">
        <div className="checkmate-banner">
          <div className="checkmate-ornament">✦ &nbsp; Sanctum Judgment &nbsp; ✦</div>
          <div className="checkmate-crown" id="checkmate-crown">♔</div>
          <div className="checkmate-title" id="checkmate-title">Checkmate</div>
          <div className="checkmate-rule"></div>
          <div className="checkmate-subtitle" id="checkmate-subtitle">
            White Triumphs • The Black King Has Fallen
          </div>
          <div className="checkmate-actions">
            <button className="checkmate-btn" id="btn-checkmate-replay">
              Replay King Fall
            </button>
            <button className="checkmate-btn" id="btn-checkmate-newgame">
              New Game
            </button>
            <button className="checkmate-btn secondary" id="btn-checkmate-dismiss">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
