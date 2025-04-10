
// utils/youtubeSearch.js
import youtube from '../api/youtube';

/**
 * Converts ISO 8601 duration format to seconds
 * @param {string} duration - ISO 8601 duration (e.g. "PT5M30S")
 * @returns {number} - Duration in seconds
 */
function parseDuration(duration) {
  if (!duration) return 0;
  
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match && match[1] ? parseInt(match[1].slice(0, -1)) : 0);
  const minutes = (match && match[2] ? parseInt(match[2].slice(0, -1)) : 0);
  const seconds = (match && match[3] ? parseInt(match[3].slice(0, -1)) : 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Search for YouTube videos based on topic
 * @param {string} topic - The search query
 * @returns {Promise<Object>} - YouTube video information
 */
export async function searchYouTubeVideo(topic) {
  try {
    // Format search query to target longer educational videos
    const query = `${topic} tutorial`;
    
    // First search for videos matching the query
    const searchResponse = await youtube.get('/search', {
      params: {
        q: query,
        part: 'snippet',
        type: 'video',
        videoDuration: 'medium', // Medium videos (4-20 mins)
        videoEmbeddable: true,
        relevanceLanguage: 'en',
        order: 'relevance'
      }
    });
    
    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      throw new Error('No videos found');
    }
    
    // Get the top 3 video IDs to check their details
    const videoIds = searchResponse.data.items
      .slice(0, 3)
      .map(item => item.id.videoId)
      .join(',');
    
    // Get detailed information about these videos
    const videoResponse = await youtube.get('/videos', {
      params: {
        id: videoIds,
        part: 'snippet,contentDetails,statistics'
      }
    });
    
    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      throw new Error('Could not get video details');
    }
    
    // Filter for videos that are at least 5 minutes long
    const filteredVideos = videoResponse.data.items
      .filter(video => {
        const duration = parseDuration(video.contentDetails.duration);
        return duration >= 300; // 5 minutes or longer
      })
      .sort((a, b) => {
        // Sort by view count (descending)
        return parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount);
      });
    
    // Use the first filtered video, or fall back to the first result if none meet criteria
    const bestVideo = filteredVideos.length > 0 
      ? filteredVideos[0] 
      : videoResponse.data.items[0];
      
    return {
      videoId: bestVideo.id,
      title: bestVideo.snippet.title,
      thumbnail: bestVideo.snippet.thumbnails.high?.url || bestVideo.snippet.thumbnails.default?.url,
      duration: parseDuration(bestVideo.contentDetails.duration),
      views: parseInt(bestVideo.statistics.viewCount || 0).toLocaleString(),
      channelName: bestVideo.snippet.channelTitle,
      description: bestVideo.snippet.description || `${topic} Tutorial`
    };
  } catch (error) {
    console.error('Error searching YouTube:', error);
    
    // Return fallback data if there's an error
    return {
      videoId: 'dQw4w9WgXcQ', // Fallback video ID
      title: `${topic} Tutorial`,
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      duration: 0,
      views: '0',
      channelName: 'Unknown',
      description: `${topic} Tutorial`
    };
  }
}
