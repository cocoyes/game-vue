<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { Crown, User, X } from 'lucide-vue-next'

const router = useRouter()
const gameStore = useGameStore()

const showSettingsModal = ref(false)

// Local state for the form, initialized from store
const formState = reactive({
  p1: { ...gameStore.player1 },
  p2: { ...gameStore.player2 }
})

const openSettings = () => {
  // Reset form to current store state
  Object.assign(formState.p1, gameStore.player1)
  Object.assign(formState.p2, gameStore.player2)
  showSettingsModal.value = true
}

const startGame = () => {
  // Save to store
  gameStore.updatePlayer1(formState.p1)
  gameStore.updatePlayer2(formState.p2)
  
  showSettingsModal.value = false
  router.push('/chess')
}

// Predefined avatars for selection (simplified)
const avatarOptions = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bot',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bella'
]

const countryOptions = ['China', 'USA', 'Japan', 'Korea', 'UK', 'France', 'Germany', 'Russia']

</script>

<template>
  <div class="lobby-page">
    <header class="lobby-header">
      <h1>Game Center</h1>
      <p>Choose your challenge</p>
    </header>

    <div class="games-grid">
      <!-- AI Chess Card -->
      <div class="game-card" @click="openSettings">
        <div class="card-image chess-bg">
          <Crown class="game-icon" :size="48" />
        </div>
        <div class="card-content">
          <h3>AI Chess</h3>
          <p>Challenge the grandmaster AI in a classic battle of strategy.</p>
          <button class="play-btn">Play Now</button>
        </div>
      </div>

      <!-- Placeholder for more games -->
      <div class="game-card coming-soon">
        <div class="card-image placeholder-bg">
          <span class="lock-icon">🔒</span>
        </div>
        <div class="card-content">
          <h3>More Games</h3>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <Transition name="modal">
      <div v-if="showSettingsModal" class="modal-overlay" @click.self="showSettingsModal = false">
        <div class="modal-content">
          <button class="close-btn" @click="showSettingsModal = false">
            <X :size="24" />
          </button>
          
          <h2>Match Setup</h2>
          
          <div class="sides-container">
            <!-- Player 1 Settings -->
            <div class="side-settings red-side">
              <h3><User :size="16"/> Red Side</h3>
              
              <div class="form-group">
                <label>Name</label>
                <input v-model="formState.p1.name" type="text" placeholder="Player Name" />
              </div>

              <div class="form-group">
                <label>Country</label>
                <select v-model="formState.p1.country">
                  <option v-for="c in countryOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Score</label>
                <input v-model.number="formState.p1.score" type="number" />
              </div>

              <div class="form-group">
                <label>Avatar</label>
                <div class="avatar-grid">
                  <img 
                    v-for="av in avatarOptions" 
                    :key="av" 
                    :src="av" 
                    class="avatar-option"
                    :class="{ selected: formState.p1.avatar === av }"
                    @click="formState.p1.avatar = av"
                  />
                </div>
              </div>
            </div>

            <div class="vs-divider">VS</div>

            <!-- Player 2 Settings -->
            <div class="side-settings black-side">
              <h3><User :size="16"/> Black Side</h3>

              <div class="form-group">
                <label>Name</label>
                <input v-model="formState.p2.name" type="text" placeholder="Player Name" />
              </div>

              <div class="form-group">
                <label>Country</label>
                <select v-model="formState.p2.country">
                  <option v-for="c in countryOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Score</label>
                <input v-model.number="formState.p2.score" type="number" />
              </div>

              <div class="form-group">
                <label>Avatar</label>
                <div class="avatar-grid">
                  <img 
                    v-for="av in avatarOptions" 
                    :key="av" 
                    :src="av" 
                    class="avatar-option"
                    :class="{ selected: formState.p2.avatar === av }"
                    @click="formState.p2.avatar = av"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="start-btn" @click="startGame">Start Game</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.lobby-page {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf2f2 0%, #e0f2fe 100%);
}

.lobby-header {
  margin-bottom: 32px;
  text-align: center;
}

.lobby-header h1 {
  font-size: 2.5rem;
  background: linear-gradient(to right, #0f766e, #2dd4bf);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.lobby-header p {
  color: #666;
  font-size: 1.1rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.game-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.05);
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.card-image {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.chess-bg {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: #fbbf24;
}

.placeholder-bg {
  background: #f1f5f9;
  color: #94a3b8;
}

.card-content {
  padding: 20px;
}

.card-content h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
  color: #1e293b;
}

.card-content p {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.5;
}

.play-btn {
  width: 100%;
  padding: 10px;
  background: #0f766e;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}

.play-btn:hover {
  background: #115e59;
}

.coming-soon {
  opacity: 0.7;
  cursor: default;
}

.coming-soon:hover {
  transform: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 800px; /* Wider for side-by-side */
  border-radius: 24px;
  padding: 32px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px;
  color: #94a3b8;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 32px;
  font-size: 1.8rem;
  color: #0f172a;
}

.sides-container {
  display: flex;
  gap: 32px;
  align-items: stretch;
}

.vs-divider {
  display: flex;
  align-items: center;
  font-weight: 900;
  font-size: 1.5rem;
  color: #cbd5e1;
}

.side-settings {
  flex: 1;
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.red-side {
  border-top: 4px solid #ef4444;
}

.black-side {
  border-top: 4px solid #1e293b;
}

.side-settings h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2dd4bf;
  outline: none;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.1);
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.avatar-option {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.avatar-option:hover {
  transform: scale(1.05);
}

.avatar-option.selected {
  border-color: #2dd4bf;
  box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.2);
}

.modal-footer {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.start-btn {
  padding: 14px 48px;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(15, 118, 110, 0.4);
  transition: all 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(15, 118, 110, 0.4);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sides-container {
    flex-direction: column;
  }
  
  .vs-divider {
    justify-content: center;
    margin: 16px 0;
  }
}

/* Transition classes */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}
</style>
