// api/youtube.js
import axios from 'axios';

// Fixed the API key format - removed the '&q' at the end which was causing issues
const KEY=import.meta.env.VITE_YOUTUBE;  
export default axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3/',
    params: {
        maxResults: 5,
        key: KEY
    }
});