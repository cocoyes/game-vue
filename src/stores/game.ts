import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface PlayerSettings {
    name: string
    country: string
    avatar: string
    score: number // Initial score
}

export const useGameStore = defineStore('game', () => {
    const player1 = reactive<PlayerSettings>({
        name: 'Player 1',
        country: 'China',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        score: 1000
    })

    const player2 = reactive<PlayerSettings>({
        name: 'AI Alpha',
        country: 'USA',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bot',
        score: 1000
    })

    function updatePlayer1(settings: Partial<PlayerSettings>) {
        Object.assign(player1, settings)
    }

    function updatePlayer2(settings: Partial<PlayerSettings>) {
        Object.assign(player2, settings)
    }

    return {
        player1,
        player2,
        updatePlayer1,
        updatePlayer2
    }
})
