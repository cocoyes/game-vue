<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { useRouter } from 'vue-router'
import { ArrowLeft, RefreshCw } from 'lucide-vue-next'
import { XiangqiGame, AIPlayer, type Piece } from '../utils/xiangqi' // Ensure this path is correct

const gameStore = useGameStore()
const router = useRouter()

// Initialize Game Engine
const game = ref(new XiangqiGame())
const board = computed(() => game.value.board)
const currentTurn = computed(() => game.value.turn)

// AI Agents
const aiRed = new AIPlayer(game.value, 'r', 2) // Depth 2 for speed/demo
const aiBlack = new AIPlayer(game.value, 'b', 2)

const isThinking = ref(false)
const gameStatus = ref('Preparing...')
const autoPlayInterval = ref<any>(null)
let isRunning = false

const goBack = () => {
  stopAutoPlay()
  router.push('/lobby')
}

const stopAutoPlay = () => {
  isRunning = false
  if (autoPlayInterval.value) {
    clearTimeout(autoPlayInterval.value)
    autoPlayInterval.value = null
  }
}

// The core loop for AI vs AI
const runGameLoop = async () => {
  if (!isRunning || game.value.gameOver) {
    gameStatus.value = game.value.gameOver 
      ? `Game Over! ${game.value.winner === 'r' ? 'Red' : 'Black'} Wins!` 
      : 'Paused'
    return
  }

  const currentPlayer = game.value.turn === 'r' ? 'Red' : 'Black'
  gameStatus.value = `${currentPlayer} AI is thinking...`
  isThinking.value = true

  // Select AI agent
  const currentAI = game.value.turn === 'r' ? aiRed : aiBlack

  // Add a small delay for visual realism
  setTimeout(async () => {
    try {
      const move = await currentAI.getBestMove()
      if (move) {
        // Play Move
        game.value.movePiece(move.fx, move.fy, move.tx, move.ty)
        
        // Use a sound effect here if desired
        // playSound() 

        // Schedule next turn
        isThinking.value = false
        if (isRunning) {
             // 1 second delay between moves so user can see it
            autoPlayInterval.value = setTimeout(runGameLoop, 1000) 
        }
      } else {
        // No moves available (Checkmate/Stalemate)
        game.value.gameOver = true
        gameStatus.value = "Game Over (Stalemate)"
        isRunning = false
      }
    } catch (e) {
      console.error("AI Error", e)
      isRunning = false
    }
  }, 500)
}

const startGame = () => {
  if (isRunning) return
  isRunning = true
  gameStatus.value = "Game Started"
  runGameLoop()
}

const resetGame = () => {
  stopAutoPlay()
  game.value = new XiangqiGame()
  // Re-init agents with new game instance
  aiRed.game = game.value
  aiBlack.game = game.value
  
  // Start again automatically
  setTimeout(startGame, 1000)
}

onMounted(() => {
  // Auto start on mount as requested
  startGame()
})

onUnmounted(() => {
  stopAutoPlay()
})

// Helper to get piece text/style
const getPieceChar = (p: Piece) => {
  const map: Record<string, string> = {
    'K': '將', 'A': '士', 'E': '象', 'H': '馬', 'R': '車', 'C': '炮', 'S': '卒', // Black
    'K_r': '帥', 'A_r': '仕', 'E_r': '相', 'H_r': '傌', 'R_r': '俥', 'C_r': '砲', 'S_r': '兵' // Red
  }
  const key = p.color === 'r' ? `${p.type}_r` : p.type
  return map[key] || p.type
}

</script>

<template>
  <div class="game-page">
    <!-- Top Bar -->
    <div class="top-bar">
      <button class="icon-btn" @click="goBack">
        <ArrowLeft :size="24" />
      </button>
      <div class="center-info">
        <h2 class="game-title">AI Chess Battle</h2>
        <span class="status-badge" :class="{ 'red-turn': currentTurn === 'r', 'black-turn': currentTurn === 'b' }">
          {{ gameStatus }}
        </span>
      </div>
      <button class="icon-btn" @click="resetGame">
        <RefreshCw :size="24" />
      </button>
    </div>

    <!-- Opponent Area (Player 2) -->
    <div class="player-area opponent">
      <div class="player-card" :class="{ active: currentTurn === 'b' }">
        <div class="avatar-container">
          <img :src="gameStore.player2.avatar" alt="Opponent Avatar" />
          <div class="country-badge">{{ gameStore.player2.country }}</div>
        </div>
        <div class="player-info">
          <div class="name">{{ gameStore.player2.name }}</div>
          <div class="score">Score: <span>{{ gameStore.player2.score }}</span></div>
        </div>
      </div>
    </div>

    <!-- Game Board Area -->
    <div class="board-container">
      <div class="chess-board-wrapper">
        <div class="chess-board">
          <!-- Grid Lines -->
           <div class="grid-lines">
             <!-- Horizontal -->
             <div v-for="i in 10" :key="`h-${i}`" class="line-h" :style="{ top: `calc((100% / 10) * ${i} - (100% / 20))` }"></div>
             <!-- Vertical -->
             <div v-for="i in 9" :key="`v-${i}`" class="line-v" :style="{ left: `calc((100% / 9) * ${i} - (100% / 18))` }"></div>
             <!-- River Cover (hides vertical lines in middle) -->
              <div class="river-bg"></div>
              <!-- Diagonal Palace Lines (Top) -->
              <div class="palace-line p-top-1"></div>
              <div class="palace-line p-top-2"></div>
              <!-- Diagonal Palace Lines (Bottom) -->
              <div class="palace-line p-bot-1"></div>
              <div class="palace-line p-bot-2"></div>
           </div>

           <!-- River Text -->
           <div class="river">
             <span>楚 河</span>
             <span>漢 界</span>
           </div>

           <!-- Pieces -->
           <template v-for="(row, y) in board" :key="y">
             <template v-for="(piece, x) in row" :key="x">
               <div 
                 v-if="piece"
                 class="piece" 
                 :class="[
                   piece.color === 'r' ? 'piece-red' : 'piece-black',
                   // Add a subtle bounce if it just moved (can add logic later)
                 ]"
                 :style="{ 
                   left: `calc((100% / 9) * ${x+1} - (100% / 18))`, 
                   top: `calc((100% / 10) * ${y+1} - (100% / 20))` 
                 }"
               >
                 {{ getPieceChar(piece) }}
               </div>
             </template>
           </template>
        </div>
      </div>
    </div>

    <!-- Player Area (Player 1) -->
    <div class="player-area self">
      <div class="player-card reverse" :class="{ active: currentTurn === 'r' }">
        <div class="avatar-container">
          <img :src="gameStore.player1.avatar" alt="Player Avatar" />
          <div class="country-badge">{{ gameStore.player1.country }}</div>
        </div>
         <div class="player-info">
          <div class="name">{{ gameStore.player1.name }}</div>
          <div class="score">Score: <span>{{ gameStore.player1.score }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-page {
  height: 100vh;
  background: #1e293b;
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.center-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-badge {
  font-size: 0.8rem;
  padding: 4px 12px;
  background: #334155;
  border-radius: 12px;
  margin-top: 4px;
  transition: all 0.3s;
}

.status-badge.red-turn {
  background: rgba(220, 38, 38, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.5);
}

.status-badge.black-turn {
  background: rgba(0, 0, 0, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.icon-btn {
  color: white;
  padding: 8px;
  border-radius: 50%;
  transition: bg 0.2s;
}

.icon-btn:hover {
  background: rgba(255,255,255,0.1);
}

.game-title {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.player-area {
  padding: 10px 24px;
  display: flex;
  justify-content: center;
  transition: all 0.3s;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.05);
  padding: 8px 20px;
  border-radius: 50px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.05);
  min-width: 240px;
  opacity: 0.6;
  transform: scale(0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.player-card.active {
  opacity: 1;
  transform: scale(1);
  background: rgba(255,255,255,0.15);
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
  border-color: rgba(255,255,255,0.2);
}

.player-card.reverse {
  flex-direction: row-reverse;
  text-align: right;
}

.avatar-container {
  position: relative;
}

.avatar-container img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  background: #334155;
}

.country-badge {
  position: absolute;
  bottom: -4px;
  right: -8px;
  background: #f59e0b;
  color: black;
  font-size: 0.55rem;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  white-space: nowrap;
}

.player-info .name {
  font-weight: 600;
  font-size: 1rem;
}

.player-info .score {
  font-size: 0.8rem;
  color: #94a3b8;
}

.player-info .score span {
  color: #2dd4bf;
  font-weight: bold;
}

.board-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  overflow: hidden;
}

.chess-board-wrapper {
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
}


/* Board Layout - Intersections */
.chess-board {
  width: 90vh;
  height: 100vh;
  max-width: 450px; /* 9 units wide */
  max-height: 500px; /* 10 units high */
  aspect-ratio: 9/10;
  background: #DEB887;
  position: relative;
  margin: 30px; /* Space for pieces on the edge */
  box-shadow: 0 20px 30px rgba(0,0,0,0.3);
  user-select: none;
}

.grid-lines {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
}

.line-h {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #713f12;
}

.line-v {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #713f12;
}

.river-bg {
  position: absolute;
  top: 40%; /* Between line 4 and 5 (0-indexed) -> 4/9 to 5/9?? No. lines are y=0..9 */
  /* River is between y=4 and y=5 */
  /* y=4 is at 4/9 = 44.4% */
  /* y=5 is at 5/9 = 55.5% */
  /* We want to cover the verticals between these two. */
  top: 44.6%; 
  height: 10.8%;
  left: 1px;
  right: 1px;
  background: #DEB887; /* Same as board bg */
  z-index: 1;
}

.palace-line {
  position: absolute;
  background-color: #713f12;
  height: 1px;
  width: 140%; /* Sqrt(2) roughly */
  transform-origin: 0 0;
}
/* Palace X coords: 3..5. Y coords: 0..2 (Black), 7..9 (Red) */
/* Need diagonals. */
/* CSS diagonal lines are tricky without SVG. Simplified: skip or use simple approximation. */
/* Let's skip diagonals for this 'perfect alignment' fix to ensure basics work first. */

.piece {
  width: 12%; /* Slightly larger than grid gap */
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
  position: absolute;
  font-family: "KaiTi", "STKaiti", serif;
  transform: translate(-50%, -50%);
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 10;
}

.piece-black {
  background: #fdf6e3; 
  color: #1a1a1a;
  border: 1px solid #1a1a1a;
}

.piece-red {
  background: #fdf6e3;
  color: #dc2626;
  border: 1px solid #dc2626;
}


</style>
