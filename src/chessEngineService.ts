/**
 * Chess Engine Service with Stockfish Worker integration up to 3200 Elo,
 * FEN generation, and Minimax fallback.
 */

export interface EloDifficulty {
  elo: number;
  title: string;
  skillLevel: number;
  depth: number;
  moveTime: number;
  limitStrength: boolean;
}

export const ELO_DIFFICULTIES: Record<number, EloDifficulty> = {
  800: {
    elo: 800,
    title: 'Novice Apprentice',
    skillLevel: 1,
    depth: 3,
    moveTime: 200,
    limitStrength: true
  },
  1200: {
    elo: 1200,
    title: 'Acolyte',
    skillLevel: 5,
    depth: 5,
    moveTime: 350,
    limitStrength: true
  },
  1600: {
    elo: 1600,
    title: 'Sanctum Knight',
    skillLevel: 9,
    depth: 7,
    moveTime: 500,
    limitStrength: true
  },
  2000: {
    elo: 2000,
    title: 'Archmage',
    skillLevel: 13,
    depth: 10,
    moveTime: 750,
    limitStrength: true
  },
  2400: {
    elo: 2400,
    title: 'Grand Magus',
    skillLevel: 17,
    depth: 12,
    moveTime: 950,
    limitStrength: true
  },
  2800: {
    elo: 2800,
    title: 'High Altar Master',
    skillLevel: 19,
    depth: 14,
    moveTime: 1200,
    limitStrength: true
  },
  3200: {
    elo: 3200,
    title: 'Grandmaster Engine God',
    skillLevel: 20,
    depth: 16,
    moveTime: 1500,
    limitStrength: false
  }
};

export interface MoveCoordinate {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  promotion?: string;
}

class StockfishEngineService {
  private worker: Worker | null = null;
  private isReady = false;
  private workerFailed = false;
  private pendingResolve: ((move: MoveCoordinate | null) => void) | null = null;
  private currentElo = 3200;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      if (typeof window === 'undefined' || typeof Worker === 'undefined') {
        return;
      }
      this.worker = new Worker('/stockfish/stockfish.js');
      this.worker.onmessage = (e: MessageEvent) => {
        this.handleWorkerMessage(String(e.data));
      };
      this.worker.onerror = (err) => {
        console.warn('Stockfish worker error, using fallback evaluator:', err);
        this.workerFailed = true;
      };
      this.worker.postMessage('uci');
      this.worker.postMessage('isready');
      this.setDifficulty(this.currentElo);
    } catch (e) {
      console.warn('Could not initialize Stockfish web worker:', e);
      this.workerFailed = true;
    }
  }

  public setDifficulty(elo: number) {
    this.currentElo = elo;
    const config = ELO_DIFFICULTIES[elo] || ELO_DIFFICULTIES[3200];
    if (!this.worker) return;

    if (config.limitStrength) {
      this.worker.postMessage('setoption name UCI_LimitStrength value true');
      this.worker.postMessage(`setoption name UCI_Elo value ${config.elo}`);
      this.worker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
    } else {
      // 3200 Elo: Peak engine strength
      this.worker.postMessage('setoption name UCI_LimitStrength value false');
      this.worker.postMessage('setoption name Skill Level value 20');
    }
  }

  private handleWorkerMessage(msg: string) {
    if (msg.includes('readyok') || msg.includes('uciok')) {
      this.isReady = true;
      return;
    }

    if (msg.startsWith('bestmove')) {
      const parts = msg.split(' ');
      const bestMoveStr = parts[1];
      if (this.pendingResolve) {
        const resolve = this.pendingResolve;
        this.pendingResolve = null;
        if (!bestMoveStr || bestMoveStr === '(none)') {
          resolve(null);
        } else {
          resolve(this.parseUciMove(bestMoveStr));
        }
      }
    }
  }

  public parseUciMove(uci: string): MoveCoordinate | null {
    if (!uci || uci.length < 4) return null;
    const fromCol = uci.charCodeAt(0) - 97; // 'a' -> 0
    const fromRow = 8 - parseInt(uci[1], 10); // '8' -> 0, '1' -> 7
    const toCol = uci.charCodeAt(2) - 97;
    const toRow = 8 - parseInt(uci[3], 10);
    const promo = uci.length >= 5 ? uci[4] : undefined;

    if (
      fromCol < 0 || fromCol > 7 ||
      fromRow < 0 || fromRow > 7 ||
      toCol < 0 || toCol > 7 ||
      toRow < 0 || toRow > 7
    ) {
      return null;
    }

    return {
      fromR: fromRow,
      fromC: fromCol,
      toR: toRow,
      toC: toCol,
      promotion: promo
    };
  }

  public boardToFen(
    boardState: any[][],
    currentTurn: 'w' | 'b',
    castlingRights = 'KQkq',
    enPassant = '-'
  ): string {
    const rows: string[] = [];
    const typeToChar: Record<string, string> = {
      pawn: 'p',
      knight: 'n',
      bishop: 'b',
      rook: 'r',
      queen: 'q',
      king: 'k'
    };

    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      let rowStr = '';
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rowStr += emptyCount;
            emptyCount = 0;
          }
          const ch = typeToChar[piece.type] || 'p';
          rowStr += piece.color === 'w' ? ch.toUpperCase() : ch.toLowerCase();
        }
      }
      if (emptyCount > 0) {
        rowStr += emptyCount;
      }
      rows.push(rowStr);
    }

    const castling = castlingRights || '-';
    return `${rows.join('/')} ${currentTurn} ${castling} ${enPassant} 0 1`;
  }

  public computeAIMove(
    fen: string,
    elo = 3200
  ): Promise<MoveCoordinate | null> {
    const config = ELO_DIFFICULTIES[elo] || ELO_DIFFICULTIES[3200];
    this.setDifficulty(elo);

    if (!this.worker || this.workerFailed) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      this.pendingResolve = resolve;

      // Stop any current search and set position
      this.worker!.postMessage('stop');
      this.worker!.postMessage(`position fen ${fen}`);

      // Search with configured depth and movetime
      if (config.elo >= 3200) {
        this.worker!.postMessage(`go depth ${config.depth} movetime ${config.moveTime}`);
      } else {
        this.worker!.postMessage(`go depth ${config.depth} movetime ${config.moveTime}`);
      }

      // Safety timeout in case worker hangs
      setTimeout(() => {
        if (this.pendingResolve === resolve) {
          this.pendingResolve = null;
          resolve(null);
        }
      }, config.moveTime + 3000);
    });
  }
}

export const stockfishEngine = new StockfishEngineService();
