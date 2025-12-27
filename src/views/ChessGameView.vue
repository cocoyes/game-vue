<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { useRouter } from 'vue-router'
import { ArrowLeft, RefreshCw } from 'lucide-vue-next'
import { XiangqiGame, AIPlayer, type Piece } from '../utils/xiangqi' // Ensure this path is correct
import XiangqiBoard from '../components/XiangqiBoard.vue'

const gameStore = useGameStore()
const router = useRouter()

// Initialize Game Engine
const game = ref(new XiangqiGame())
const board = computed(() => game.value.board)
const currentTurn = computed(() => game.value.turn)
const lastMove = computed(() => game.value.lastMove) 

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
            autoPlayInterval.value = setTimeout(runGameLoop, 1500) 
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

// Convert board coords (0-8, 0-9) to percentage positions for absolute placement
// Board SVG is 90x100.
// Grid starts at 5,5. Step is 10.
// x% = (5 + x*10) / 90 * 100
// y% = (5 + y*10) / 100 * 100
const getPieceStyle = (x: number, y: number) => {
   const left = (5 + x * 10) / 90 * 100
   const top = (5 + y * 10)
   return {
     left: `${left}%`,
     top: `${top}%`
   }
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
          <XiangqiBoard />

           <!-- Last Move Highlights if any -->
           <div v-if="lastMove" class="last-move-marker from" :style="getPieceStyle(lastMove.fx, lastMove.fy)"></div>
           <div v-if="lastMove" class="last-move-marker to" :style="getPieceStyle(lastMove.tx, lastMove.ty)"></div>

           <!-- Pieces -->
           <template v-for="(row, y) in board" :key="y">
             <template v-for="(piece, x) in row" :key="x">
               <div 
                 v-if="piece"
                 class="piece" 
                 :class="[
                   piece.color === 'r' ? 'piece-red' : 'piece-black'
                 ]"
                 :style="getPieceStyle(x, y)"
               >
                 <div class="piece-inner">
                   {{ getPieceChar(piece) }}
                 </div>
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
  /* background: #DEB887; Removed, now handled by SVG */
  position: relative;
  margin: 30px; 
  /* box-shadow: 0 20px 30px rgba(0,0,0,0.3); handled by svg slightly or container */
  user-select: none;
}

.piece {
  /* Pieces are positioned relatively by %, so width/height relative to board */
  /* Board is 90 units wide. Cell is 10. Piece should be ~8-9 units */
  /* 9/90 = 10% */
  width: 10%; 
  height: 10%; /* Since board is 90x100, height % is different? No, aspect ratio is fixed. */
  /* Wait. width: 10% of 450px is 45px. height: 10% of 500px is 50px. */
  /* We want square pieces. */
  /* Use aspect-ratio on piece? and max dimension. */
  /* Or just use unitless calculations if aspect-ratio of container is fixed 9/10 */
  /* Actually, 10% width is 1/9th of width. */
  /* 10% height is 1/10th of height. */
  /* Since W/H = 9/10, 10%W = W/9? No 10% is W/10. */
  /* We want piece size = grid size ~ 10 units. */
  /* 10 units / 90 units width = 11.11% */
  /* 10 units / 100 units height = 10% */
  width: 11.11%;
  height: 10%;
  
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  /* transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1); */
  /* Smooth movement */
  transition: left 0.5s ease-out, top 0.5s ease-out;
}

.piece-inner {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold; 
  font-size: 1.2rem;
  font-family: "KaiTi", "STKaiti", serif;
  box-shadow: 
    1px 2px 4px rgba(0,0,0,0.4),
    inset 0 2px 6px rgba(255,255,255,0.3),
    inset 0 -2px 4px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.15);
}

.piece-black .piece-inner {
  background: #fdf6e3; 
  color: #1a1a1a;
  border-color: #5d4037;
}

.piece-red .piece-inner {
  background: #fdf6e3;
  color: #c92a2a;
  border-color: #c92a2a;
}

.last-move-marker {
  position: absolute;
  width: 11.11%;
  height: 10%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.last-move-marker::after {
  content: '';
  width: 90%;
  height: 90%;
  border: 2px dashed rgba(45, 212, 191, 0.6);
  border-radius: 50%;
  background: rgba(45, 212, 191, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.5; }
}



</style>
