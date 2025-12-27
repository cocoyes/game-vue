<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { useRouter } from 'vue-router'
import { ArrowLeft, RefreshCw } from 'lucide-vue-next'

const gameStore = useGameStore()
const router = useRouter()

const goBack = () => {
  if (confirm('Are you sure you want to quit current game?')) {
    router.push('/')
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
      <h2 class="game-title">AI Chess Battle</h2>
      <button class="icon-btn">
        <RefreshCw :size="24" />
      </button>
    </div>

    <!-- Opponent Area (Player 2) -->
    <div class="player-area opponent">
      <div class="player-card">
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
      <div class="chess-board">
        <!-- Visualization of a board (CSS grid) -->
        <div class="board-grid">
           <!-- Just a visual representation for now -->
           <div class="grid-line" v-for="i in 9" :key="`h-${i}`" :style="{ top: `${(i-1)*12.5}%` }"></div>
           <div class="grid-line v-line" v-for="i in 9" :key="`v-${i}`" :style="{ left: `${(i-1)*12.5}%` }"></div>
           
           <!-- River -->
           <div class="river">
             <span>楚 河</span>
             <span>漢 界</span>
           </div>

           <!-- Some Pieces (Demo) -->
           <div class="piece piece-black" style="top: 0%; left: 50%; transform: translate(-50%, -50%);">
             將
           </div>
           <div class="piece piece-red" style="bottom: 0%; left: 50%; transform: translate(-50%, 50%);">
             帥
           </div>
        </div>
      </div>
    </div>

    <!-- Player Area (Player 1) -->
    <div class="player-area self">
      <div class="player-card reverse">
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
  padding: 16px 24px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
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
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.player-area {
  padding: 16px 24px;
  display: flex;
  justify-content: center;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.1);
  padding: 12px 24px;
  border-radius: 50px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.1);
  min-width: 250px;
}

.player-card.reverse {
  flex-direction: row-reverse;
  text-align: right;
}

.avatar-container {
  position: relative;
}

.avatar-container img {
  width: 56px;
  height: 56px;
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
  font-size: 0.6rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}

.player-info .name {
  font-weight: 600;
  font-size: 1.1rem;
}

.player-info .score {
  font-size: 0.85rem;
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
  padding: 24px;
}

.chess-board {
  width: 100%;
  max-width: 400px; /* Standard Xiangqi ratio approx 9:10 */
  aspect-ratio: 9/10;
  background: #eab308; /* Wood colorish */
  background: url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Xiangqi_board.svg/1200px-Xiangqi_board.svg.png') no-repeat center center;
  background-size: cover;
  border-radius: 4px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
  /* Simple fallback if image fails */
  background-color: #DEB887; 
}

/* Fallback grid if image doesn't load/simulate placement */
.board-grid {
  position: absolute;
  top: 4%;
  left: 4%;
  right: 4%;
  bottom: 4%;
}

.river {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-around;
  font-size: 1.5rem;
  font-family: "KaiTi", serif;
  opacity: 0.4;
  pointer-events: none;
}

.piece {
  width: 10%;
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  position: absolute;
  font-family: "KaiTi", serif;
  border: 2px solid rgba(0,0,0,0.2);
}

.piece-black {
  background: #fdaf66; /* Wood light */
  color: black;
  border: 1px solid #333;
}

.piece-red {
  background: #fdaf66;
  color: #dc2626;
  border: 1px solid #dc2626;
}

/* Animations for entering */
.player-card {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.chess-board {
  animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
</style>
