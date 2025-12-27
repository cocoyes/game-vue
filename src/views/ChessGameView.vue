<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { useRouter } from 'vue-router'
import { ArrowLeft, RefreshCw } from 'lucide-vue-next'
import { XiangqiGame, AIPlayer, type Piece } from '../utils/xiangqi'
import XiangqiBoard from '../components/XiangqiBoard.vue'

const gameStore = useGameStore()
const router = useRouter()

/* ---------------- 游戏状态 ---------------- */
const game = ref(new XiangqiGame())
const board = computed(() => game.value.board)
const currentTurn = computed(() => game.value.turn)
const lastMove = computed(() => game.value.lastMove)
const gameStatus = ref('Preparing...')

let isRunning = false
let timer: any = null

/* ---------------- AI ---------------- */
const aiRed = new AIPlayer(game.value, 'r', 2)
const aiBlack = new AIPlayer(game.value, 'b', 2)

/* ---------------- 控制 ---------------- */
const goBack = () => {
  stop()
  router.push('/lobby')
}

const stop = () => {
  isRunning = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

  const runLoop = async () => {
  if (!isRunning || game.value.gameOver) {
    gameStatus.value = game.value.gameOver
      ? `Game Over · ${game.value.winner === 'r' ? 'Red' : 'Black'} Wins`
      : 'Paused'
    return
  }

  const isRed = game.value.turn === 'r'
  gameStatus.value = `${isRed ? 'Red' : 'Black'} AI Thinking...`

  const ai = isRed ? aiRed : aiBlack

  // Random delay between 2000ms and 4000ms
  const delay = Math.floor(Math.random() * 2000) + 2000
  
  timer = setTimeout(async () => {
    const move = await ai.getBestMove()
    if (move) {
      game.value.movePiece(move.fx, move.fy, move.tx, move.ty)
      runLoop()
    } else {
      game.value.gameOver = true
      gameStatus.value = 'Game Over · No Moves'
    }
  }, delay)
}

const start = () => {
  if (isRunning) return
  isRunning = true
  runLoop()
}

const resetGame = () => {
  stop()
  game.value = new XiangqiGame()
  aiRed.game = game.value
  aiBlack.game = game.value
  setTimeout(start, 500)
}

onMounted(start)
onUnmounted(stop)

/* ---------------- 工具 ---------------- */
const getPieceChar = (p: Piece) => {
  const map: Record<string, string> = {
    K: '將', A: '士', E: '象', H: '馬', R: '車', C: '炮', S: '卒',
    K_r: '帥', A_r: '仕', E_r: '相', H_r: '傌', R_r: '俥', C_r: '砲', S_r: '兵'
  }
  return map[p.color === 'r' ? `${p.type}_r` : p.type]
}

/**
 * 关键修复点：
 * 棋盘是 90 × 100
 * 坐标必须全部用 %
 */
const getPieceStyle = (x: number, y: number) => {
  return {
    left: `${((5 + x * 10) / 90) * 100}%`,
    top: `${((5 + y * 10) / 100) * 100}%`
  }
}
</script>

<template>
  <div class="game-page">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <button class="icon-btn" @click="goBack">
        <ArrowLeft :size="22" />
      </button>

      <div class="center-info">
        <div class="game-title">AI Chinese Chess</div>
        <div
          class="status-badge"
          :class="{
            'red-turn': currentTurn === 'r',
            'black-turn': currentTurn === 'b'
          }"
        >
          {{ gameStatus }}
        </div>
      </div>

      <button class="icon-btn" @click="resetGame">
        <RefreshCw :size="22" />
      </button>
    </div>

    <!-- 主布局：左侧玩家 - 中间棋盘 - 右侧玩家 -->
    <div class="main-content">
      <!-- 左侧：对手 (黑) -->
      <div class="side-panel">
        <div class="player-card" :class="{ active: currentTurn === 'b' }">
          <img :src="gameStore.player2.avatar" />
          <div class="player-info">
            <div class="name">Black (AI)</div>
            <div class="score">Score {{ gameStore.player2.score }}</div>
          </div>
        </div>
      </div>

      <!-- 中间：棋盘 -->
      <div class="board-container">
        <div class="chess-board">
          <XiangqiBoard />

          <!-- 上一步 -->
          <div
            v-if="lastMove"
            class="last-move"
            :style="getPieceStyle(lastMove.fx, lastMove.fy)"
          />
          <div
            v-if="lastMove"
            class="last-move"
            :style="getPieceStyle(lastMove.tx, lastMove.ty)"
          />

          <!-- 棋子 -->
          <template v-for="(row, y) in board" :key="y">
            <template v-for="(piece, x) in row" :key="x">
              <div
                v-if="piece"
                class="piece"
                :class="piece.color === 'r' ? 'red' : 'black'"
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

      <!-- 右侧：自己 (红) -->
      <div class="side-panel">
        <div class="player-card" :class="{ active: currentTurn === 'r' }">
          <img :src="gameStore.player1.avatar" />
          <div class="player-info">
            <div class="name">Red (AI)</div>
            <div class="score">Score {{ gameStore.player1.score }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-page {
  height: 100dvh;
  background: #0f172a;
  color: #fff;
  display: flex;
  flex-direction: column;
}

/* 顶部 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.8);
  flex-shrink: 0;
}

.center-info {
  text-align: center;
}

.game-title {
  font-weight: 600;
}

.status-badge {
  margin-top: 4px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: #334155;
  transition: 0.3s;
}

.status-badge.red-turn {
  background: rgba(220, 38, 38, 0.6);
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
}

.status-badge.black-turn {
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.icon-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;
  padding: 10px;
  gap: 20px;
}

.side-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 玩家卡片 */
.player-card {
  display: flex;
  flex-direction: column; /* 侧边改为垂直布局更好看 */
  gap: 12px;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  opacity: 0.5;
  transition: 0.3s;
  border: 2px solid transparent;
  min-width: 120px;
  text-align: center;
}

.player-card.active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(45, 212, 191, 0.6);
  box-shadow: 0 0 20px rgba(45, 212, 191, 0.2);
  transform: scale(1.05);
}

.player-card img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
}

.player-info .name {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 4px;
}

.player-info .score {
  font-size: 0.9em;
  opacity: 0.7;
}

/* 棋盘 */
.board-container {
  flex: 2; /* 棋盘占据更多空间 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 限制最大高度，防止溢出 */
  max-height: 100%;
}

.chess-board {
  position: relative;
  height: 95%; /* 尽可能填满高度 */
  aspect-ratio: 9 / 10; /* 保持棋盘比例 */
  max-width: 100%;
}

/* 棋子 */
.piece {
  position: absolute;
  width: 11.11%;
  height: 10%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: left 0.4s ease, top 0.4s ease;
  z-index: 10;
}

.piece-inner {
  width: 88%;
  height: 88%;
  border-radius: 50%;
  background: #fdf6e3;
  font-family: "KaiTi", "STKaiti", serif;
  font-weight: bold;
  font-size: 1.4em; /* 稍微大一点 */
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  border: 2px solid rgba(0,0,0,0.1);
}

.red .piece-inner {
  color: #c92a2a;
  border-color: #c92a2a;
}

.black .piece-inner {
  color: #111;
  border-color: #111;
}

/* 上一步 */
.last-move {
  position: absolute;
  width: 11.11%;
  height: 10%;
  transform: translate(-50%, -50%);
  border: 2px dashed rgba(45, 212, 191, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(45, 212, 191, 0.4);
  z-index: 5;
}
</style>
