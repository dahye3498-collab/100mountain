export type Mountain = {
    id: string
    name: string
    height: number
    region: string
    lat: number
    lng: number
    difficulty: 'easy' | 'medium' | 'hard'
    created_at: string
}

export type ClimbRecord = {
    id: string
    user_id: string
    mountain_id: string
    climbed_at: string
    memo: string
    photos: string[]
    created_at: string
    mountain?: Mountain
}
