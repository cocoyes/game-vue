// Basic Xiangqi (Chinese Chess) Logic and AI

export type PieceType = 'K' | 'A' | 'E' | 'H' | 'R' | 'C' | 'S' // King, Advisor, Elephant, Horse, Rook, Cannon, Soldier
export type Color = 'r' | 'b' // Red (r) moves first, Black (b)

export interface Piece {
    type: PieceType
    color: Color
}

export interface Position {
    x: number // 0-8
    y: number // 0-9
}

// 0-8 (width), 0-9 (height)
// Red is usually at the bottom (y=9...7), Black at top (y=0...2)
// For array indexing: board[y][x]

/* 
  Initial Board Setup:
  Black (Top):
  R H E A K A E H R  (y=0)
  . . . . . . . . .  (y=1)
  . C . . . . . C .  (y=2)
  S . S . S . S . S  (y=3)
  . . . . . . . . .  (y=4)
       River
  . . . . . . . . .  (y=5)
  S . S . S . S . S  (y=6)
  . C . . . . . C .  (y=7)
  . . . . . . . . .  (y=8)
  R H E A K A E H R  (y=9)
  Red (Bottom)
*/

export const INITIAL_BOARD: (Piece | null)[][] = [
    // Black pieces (y=0 to 4 is black territory usually)
    [
        { type: 'R', color: 'b' }, { type: 'H', color: 'b' }, { type: 'E', color: 'b' }, { type: 'A', color: 'b' }, { type: 'K', color: 'b' }, { type: 'A', color: 'b' }, { type: 'E', color: 'b' }, { type: 'H', color: 'b' }, { type: 'R', color: 'b' }
    ],
    [null, null, null, null, null, null, null, null, null],
    [
        null, { type: 'C', color: 'b' }, null, null, null, null, null, { type: 'C', color: 'b' }, null
    ],
    [
        { type: 'S', color: 'b' }, null, { type: 'S', color: 'b' }, null, { type: 'S', color: 'b' }, null, { type: 'S', color: 'b' }, null, { type: 'S', color: 'b' }
    ],
    [null, null, null, null, null, null, null, null, null],

    // River

    [null, null, null, null, null, null, null, null, null],
    [
        { type: 'S', color: 'r' }, null, { type: 'S', color: 'r' }, null, { type: 'S', color: 'r' }, null, { type: 'S', color: 'r' }, null, { type: 'S', color: 'r' }
    ],
    [
        null, { type: 'C', color: 'r' }, null, null, null, null, null, { type: 'C', color: 'r' }, null
    ],
    [null, null, null, null, null, null, null, null, null],
    [
        { type: 'R', color: 'r' }, { type: 'H', color: 'r' }, { type: 'E', color: 'r' }, { type: 'A', color: 'r' }, { type: 'K', color: 'r' }, { type: 'A', color: 'r' }, { type: 'E', color: 'r' }, { type: 'H', color: 'r' }, { type: 'R', color: 'r' }
    ]
]

// Piece values for Evaluation (Simple material balance)
const PIECE_VALUES: Record<PieceType, number> = {
    'K': 10000,
    'R': 90,
    'C': 45,
    'H': 40,
    'E': 20,
    'A': 20,
    'S': 10
    // Note: Soldier value increases when crossing river, handled in eval function
}


export class XiangqiGame {
    board: (Piece | null)[][]
    turn: Color = 'r'
    history: string[] = []
    gameOver: boolean = false
    winner: Color | null = null
    lastMove: { fx: number, fy: number, tx: number, ty: number } | null = null

    constructor() {
        this.board = JSON.parse(JSON.stringify(INITIAL_BOARD))
    }

    isInsideBoard(x: number, y: number): boolean {
        return x >= 0 && x <= 8 && y >= 0 && y <= 9
    }

    getPiece(x: number, y: number): Piece | null {
        if (!this.isInsideBoard(x, y)) return null
        return this.board[y]![x] as Piece | null
    }

    movePiece(fromX: number, fromY: number, toX: number, toY: number): boolean {
        if (this.gameOver) return false

        // Validate basic rules (turn, piece existence)
        const piece = this.getPiece(fromX, fromY)
        if (!piece || piece.color !== this.turn) return false

        // Check if move is valid for that piece
        if (!this.isValidMove(fromX, fromY, toX, toY, piece)) return false

        // Execute move
        const target = this.getPiece(toX, toY)
        if (target && target.type === 'K') {
            this.gameOver = true
            this.winner = piece.color
        }

        this.board[toY]![toX] = piece
        this.board[fromY]![fromX] = null
        this.turn = this.turn === 'r' ? 'b' : 'r'
        this.lastMove = { fx: fromX, fy: fromY, tx: toX, ty: toY }

        return true
    }

    // Simplified valid move checker
    // Does NOT yet check for check/checkmate constraints (kings facing each other, being under check)
    // for performance in this demo
    isValidMove(fx: number, fy: number, tx: number, ty: number, piece: Piece, _ignoreKingCheck = false): boolean {
        if (!this.isInsideBoard(tx, ty)) return false
        if (fx === tx && fy === ty) return false

        const target = this.getPiece(tx, ty)
        if (target && target.color === piece.color) return false // Cannot capture own piece

        const dx = tx - fx
        const dy = ty - fy
        const adx = Math.abs(dx)
        const ady = Math.abs(dy)

        switch (piece.type) {
            case 'K': // General
                // Must stay in palace (x: 3-5, y: 0-2 or 7-9)
                if (piece.color === 'b') {
                    if (tx < 3 || tx > 5 || ty > 2) return false
                } else {
                    if (tx < 3 || tx > 5 || ty < 7) return false
                }
                return (adx + ady === 1)

            case 'A': // Advisor
                // Must stay in palace, move diagonally
                if (piece.color === 'b') {
                    if (tx < 3 || tx > 5 || ty > 2) return false
                } else {
                    if (tx < 3 || tx > 5 || ty < 7) return false
                }
                return (adx === 1 && ady === 1)

            case 'E': // Elephant
                // Move exactly 2 diagonal, cannot cross river
                if (adx !== 2 || ady !== 2) return false
                if (piece.color === 'b' && ty > 4) return false
                if (piece.color === 'r' && ty < 5) return false
                // Check elephant eye
                if (this.getPiece((fx + tx) / 2, (fy + ty) / 2)) return false
                return true

            case 'H': // Horse
                // Move 2 one way, 1 other way. Check hobbling.
                if (!((adx === 2 && ady === 1) || (adx === 1 && ady === 2))) return false
                // Hobble check
                if (adx === 2) {
                    const legX = (tx > fx) ? fx + 1 : fx - 1
                    if (this.getPiece(legX, fy)) return false // Hobbled horizontal
                } else {
                    const legY = (ty > fy) ? fy + 1 : fy - 1
                    if (this.getPiece(fx, legY)) return false // Hobbled vertical
                }
                return true

            case 'R': // Rook / Chariot
                if (fx !== tx && fy !== ty) return false
                // Check path is clear
                if (!this.isPathClear(fx, fy, tx, ty)) return false
                return true

            case 'C': // Cannon
                if (fx !== tx && fy !== ty) return false
                const pCount = this.countPiecesBetween(fx, fy, tx, ty)
                if (target) {
                    // Screen mount required for capture
                    return pCount === 1
                } else {
                    // Must be clear to move
                    return pCount === 0
                }

            case 'S': // Soldier
                // Move forward 1. After crossing river, can also move side 1.
                // Cannot move back.
                const fwd = (piece.color === 'b') ? 1 : -1 // Black y increases, Red y decreases
                if (ady === 1 && adx === 0) {
                    if (dy === fwd) return true
                    return false
                }
                if (adx === 1 && ady === 0) {
                    // Valid only if crossed river
                    if (piece.color === 'b') {
                        if (fy <= 4) return false
                    } else {
                        if (fy >= 5) return false
                    }
                    return true
                }
                return false
        }
        return false
    }

    isPathClear(x1: number, y1: number, x2: number, y2: number): boolean {
        return this.countPiecesBetween(x1, y1, x2, y2) === 0
    }

    countPiecesBetween(x1: number, y1: number, x2: number, y2: number): number {
        let count = 0
        if (x1 === x2) {
            const min = Math.min(y1, y2)
            const max = Math.max(y1, y2)
            for (let i = min + 1; i < max; i++) {
                if (this.board[i]![x1]) count++
            }
        } else if (y1 === y2) {
            const min = Math.min(x1, x2)
            const max = Math.max(x1, x2)
            for (let i = min + 1; i < max; i++) {
                if (this.board[y1]![i]) count++
            }
        }
        return count
    }

    // -- AI Helpers --

    getAllMoves(color: Color): { fx: number, fy: number, tx: number, ty: number }[] {
        const moves: { fx: number, fy: number, tx: number, ty: number }[] = []
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const p = this.board[y]![x]
                if (p && p.color === color) {
                    // Check all possible targets
                    // Optimization: Only check relevant squares rather than 90 squares
                    // For now, iterate all board for simplicity or hardcode pattern for each piece
                    // Iterating all is safer for compliance
                    // Optimizing for speed:
                    // We can use a simplified generator for each piece type
                    this.generatePieceMoves(x, y, p, moves)
                }
            }
        }
        return moves
    }

    generatePieceMoves(x: number, y: number, p: Piece, moves: { fx: number, fy: number, tx: number, ty: number }[]) {
        // Naive approach: try all squares. Better: try logical targets
        // R, C: scan lines. H: 8 spots. E: 4 spots. A: 4 spots. K: 4 spots. S: 3 spots.
        // This is "Good enough" for a JS demo
        for (let ty = 0; ty < 10; ty++) {
            for (let tx = 0; tx < 9; tx++) {
                if (this.isValidMove(x, y, tx, ty, p)) {
                    moves.push({ fx: x, fy: y, tx, ty })
                }
            }
        }
    }

    evaluateBoard(color: Color): number {
        let score = 0
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const p = this.board[y]![x]
                if (p) {
                    let val = PIECE_VALUES[p.type]
                    // Bonus for soldiers across river
                    if (p.type === 'S') {
                        if (p.color === 'r' && y < 5) val += 10
                        if (p.color === 'b' && y > 4) val += 10
                        // Bonus for soldiers close to general
                        if ((p.color === 'r' && y < 3 && x > 2 && x < 6) || (p.color === 'b' && y > 6 && x > 2 && x < 6)) val += 20
                    }
                    if (p.color === color) score += val
                    else score -= val
                }
            }
        }
        // Add mobility, threats etc if needed
        return score
    }
}

// Simple AI Agent
export class AIPlayer {
    game: XiangqiGame
    color: Color
    depth: number

    constructor(game: XiangqiGame, color: Color, depth = 3) {
        this.game = game
        this.color = color
        this.depth = depth
    }

    async getBestMove(): Promise<{ fx: number, fy: number, tx: number, ty: number } | null> {
        // Run in a promise to not block UI thread completely (though simpler is synchronous for now)
        return new Promise((resolve) => {
            setTimeout(() => {
                const move = this.minimaxRoot()
                resolve(move)
            }, 10)
        })
    }

    minimaxRoot() {
        const moves = this.game.getAllMoves(this.color)
        if (moves.length === 0) return null

        let bestMove = null
        let bestValue = -Infinity

        // Randomize moves to avoid identical games
        moves.sort(() => Math.random() - 0.5)

        for (const move of moves) {
            // Clone board
            const savedBoard = JSON.parse(JSON.stringify(this.game.board))
            const savedTurn = this.game.turn
            const savedGameOver = this.game.gameOver
            const savedWinner = this.game.winner

            // Apply move
            this.game.movePiece(move.fx, move.fy, move.tx, move.ty)

            const val = this.minimax(this.depth - 1, -Infinity, Infinity, false)

            // Undo move
            this.game.board = savedBoard
            this.game.turn = savedTurn
            this.game.gameOver = savedGameOver
            this.game.winner = savedWinner

            if (val > bestValue) {
                bestValue = val
                bestMove = move
            }
        }
        return bestMove
    }

    minimax(depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
        if (depth === 0 || this.game.gameOver) {
            // Evaluate from the AI's perspective (this.color)
            let score = this.game.evaluateBoard(this.color)
            // Award massive points for winning
            if (this.game.gameOver) {
                if (this.game.winner === this.color) return 100000
                else return -100000
            }
            return score
        }

        const moves = this.game.getAllMoves(this.game.turn)
        if (moves.length === 0) {
            // No moves is essentially a loss in Xiangqi (stalemate = loss usually, or treat as draw)
            // Simplified: treat as bad
            return isMaximizing ? -50000 : 50000
        }

        if (isMaximizing) {
            let best = -Infinity
            for (const move of moves) {
                // Pseudo-do-undo
                const savedBoard = JSON.parse(JSON.stringify(this.game.board))
                const savedTurn = this.game.turn
                const savedGameOver: boolean = this.game.gameOver
                const savedWinner = this.game.winner

                this.game.movePiece(move.fx, move.fy, move.tx, move.ty)
                const val = this.minimax(depth - 1, alpha, beta, false)

                this.game.board = savedBoard
                this.game.turn = savedTurn
                this.game.gameOver = savedGameOver
                this.game.winner = savedWinner

                best = Math.max(best, val)
                alpha = Math.max(alpha, best)
                if (beta <= alpha) break
            }
            return best
        } else {
            let best = Infinity
            for (const move of moves) {
                const savedBoard = JSON.parse(JSON.stringify(this.game.board))
                const savedTurn = this.game.turn
                const savedGameOver: boolean = this.game.gameOver
                const savedWinner = this.game.winner

                this.game.movePiece(move.fx, move.fy, move.tx, move.ty)
                const val = this.minimax(depth - 1, alpha, beta, true)

                this.game.board = savedBoard
                this.game.turn = savedTurn
                this.game.gameOver = savedGameOver
                this.game.winner = savedWinner

                best = Math.min(best, val)
                beta = Math.min(beta, best)
                if (beta <= alpha) break
            }
            return best
        }
    }

}
