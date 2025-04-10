// services/lessonGenerator.js
import { generateLessonContent } from '../components/GeminiAPI';
import { searchYouTubeVideo } from '../utils/youtubeSearch';

/**
 * Generates a complete lesson including relevant YouTube video
 * @param {Object} topicInfo - Object containing topic and audience
 * @returns {Promise<Object>} - Complete lesson data with video
 */
export async function generateCompleteLessonWithVideo(topicInfo) {
  try {
    // Step 1: Generate the lesson content using Gemini API
    const lessonData = await generateLessonContent(topicInfo);
    
    if (!lessonData) {
      throw new Error("Failed to generate lesson content");
    }
    
    // Step 2: Extract video topic suggestion from the Gemini response
    // This is usually more specific than just the topic
    const videoSearchTopic = lessonData.videoTopic || `${topicInfo.topic} tutorial`;
    
    // Step 3: Find a relevant YouTube video using our custom search
    const videoData = await searchYouTubeVideo(videoSearchTopic);
    
    // Step 4: Combine the lesson data with the video data
    return {
      ...lessonData,
      video: videoData
    };
  } catch (error) {
    console.error("Error generating complete lesson:", error);
    throw error;
  }
}