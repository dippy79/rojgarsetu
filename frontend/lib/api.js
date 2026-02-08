import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'

export const fetcher = (url) => axios.get(API_BASE + url).then(r=>r.data)
