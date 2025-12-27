import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface NFT {
    id: string
    title: string
    image: string
    price: number
    limit: number
    description: string
    creator: string
    creatorAvatar: string
    startTime: string
    endTime: string
}

export const useNFTStore = defineStore('nft', () => {
    const nfts = ref<NFT[]>([
        {
            id: '1',
            title: 'Ces 111',
            image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop', // Placeholder
            price: 0.10,
            limit: 2,
            description: '测试Test测试Test测试Test测试Test',
            creator: 'tYuCbJ',
            creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop',
            startTime: '2025-12-09 15:07:28',
            endTime: '2028-12-15 00:00:00'
        },
        {
            id: '2',
            title: 'Limited Edition Sea',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
            price: 0.50,
            limit: 10,
            description: 'Beautiful sea view NFT.',
            creator: 'OceanMaster',
            creatorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop',
            startTime: '2025-12-10 10:00:00',
            endTime: '2026-01-01 00:00:00'
        },
        {
            id: '3',
            title: 'Cyber Punk City',
            image: 'https://images.unsplash.com/photo-1614728853911-a4a1f5c7c9af?q=80&w=2070&auto=format&fit=crop',
            price: 1.20,
            limit: 5,
            description: 'Future city vibes.',
            creator: 'Neo',
            creatorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1780&auto=format&fit=crop',
            startTime: '2025-12-11 09:00:00',
            endTime: '2026-02-01 00:00:00'
        }
    ])

    const user = ref({
        name: 'tYuCbJ',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop',
        verified: true,
        following: 0,
        followers: 0,
        collectibles: [
            { id: '101', title: '合成成品', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop', count: 1 },
            { id: '102', title: '合成原料', image: 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?q=80&w=1974&auto=format&fit=crop', count: 2 },
            { id: '103', title: '合成原料2', image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop', count: 2 },
            { id: '104', title: 'forTest', image: 'https://images.unsplash.com/photo-1614726365723-49cfae967b0b?q=80&w=1974&auto=format&fit=crop', count: 2 }
        ]
    })

    const getNFTById = (id: string) => {
        return nfts.value.find(n => n.id === id)
    }

    return { nfts, user, getNFTById }
})
